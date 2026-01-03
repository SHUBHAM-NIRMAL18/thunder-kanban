from django.shortcuts import render
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from django.contrib.auth import get_user_model
from .serializers import RegisterSerializer, UserSerializer
from .utils import api_response

# Create your views here.


User = get_user_model()


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            
            return api_response(
                data={
                    'user': UserSerializer(user).data,
                    'tokens': {
                        'access': str(refresh.access_token),
                        'refresh': str(refresh),
                    }
                },
                meta={'message': 'User registered successfully'},
                status=status.HTTP_201_CREATED
            )
        
        errors = []
        for field, messages in serializer.errors.items():
            for message in messages:
                errors.append({'field': field, 'detail': str(message)})
        
        return api_response(
            errors=errors,
            status=status.HTTP_400_BAD_REQUEST
        )


class LoginView(TokenObtainPairView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        
        try:
            serializer.is_valid(raise_exception=True)
        except InvalidToken:
            return api_response(
                errors=[{'field': 'credentials', 'detail': 'Invalid email or password'}],
                status=status.HTTP_401_UNAUTHORIZED
            )
        except Exception as e:
            return api_response(
                errors=[{'detail': str(e)}],
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user = User.objects.get(email=request.data.get('email'))
        
        return api_response(
            data={
                'user': UserSerializer(user).data,
                'tokens': {
                    'access': serializer.validated_data['access'],
                    'refresh': serializer.validated_data['refresh'],
                }
            },
            meta={'message': 'Login successful'},
            status=status.HTTP_200_OK
        )


class RefreshTokenView(TokenRefreshView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        
        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            return api_response(
                errors=[{'code': 'token_expired', 'detail': 'Refresh token is invalid or expired'}],
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        return api_response(
            data={
                'tokens': {
                    'access': serializer.validated_data['access'],
                    'refresh': serializer.validated_data.get('refresh', request.data.get('refresh')),
                }
            },
            meta={'message': 'Token refreshed successfully'},
            status=status.HTTP_200_OK
        )


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if not refresh_token:
                return api_response(
                    errors=[{'field': 'refresh', 'detail': 'Refresh token is required'}],
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            token = RefreshToken(refresh_token)
            token.blacklist()
            
            return api_response(
                meta={'message': 'Logout successful'},
                status=status.HTTP_205_RESET_CONTENT
            )
        except TokenError:
            return api_response(
                errors=[{'detail': 'Invalid token'}],
                status=status.HTTP_400_BAD_REQUEST
            )


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return api_response(
            data=serializer.data,
            status=status.HTTP_200_OK
        )