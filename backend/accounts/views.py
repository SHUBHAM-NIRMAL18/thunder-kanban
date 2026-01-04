from django.shortcuts import render
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from django.contrib.auth import get_user_model
from drf_spectacular.utils import extend_schema, OpenApiResponse, OpenApiExample
from drf_spectacular.types import OpenApiTypes
from rest_framework import serializers as drf_serializers
from .serializers import RegisterSerializer, UserSerializer
from ..core.utils import api_response

# Create your views here.


User = get_user_model()


class LoginRequestSerializer(drf_serializers.Serializer):
    email = drf_serializers.EmailField()
    password = drf_serializers.CharField(write_only=True)


class TokenResponseSerializer(drf_serializers.Serializer):
    access = drf_serializers.CharField()
    refresh = drf_serializers.CharField()


class LoginResponseSerializer(drf_serializers.Serializer):
    user = UserSerializer()
    tokens = TokenResponseSerializer()


class RefreshRequestSerializer(drf_serializers.Serializer):
    refresh = drf_serializers.CharField()


class LogoutRequestSerializer(drf_serializers.Serializer):
    refresh = drf_serializers.CharField()


class RegisterView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        tags=['Authentication'],
        request=RegisterSerializer,
        responses={
            201: OpenApiResponse(description='User registered successfully'),
            400: OpenApiResponse(description='Validation error'),
        },
        examples=[
            OpenApiExample(
                'Register Example',
                value={
                    'email': 'user@example.com',
                    'password': 'SecurePass123!',
                    'password2': 'SecurePass123!',
                    'first_name': 'John',
                    'last_name': 'Doe'
                },
                request_only=True,
            ),
        ]
    )
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

    @extend_schema(
        tags=['Authentication'],
        request=LoginRequestSerializer,
        responses={
            200: OpenApiResponse(description='Login successful'),
            401: OpenApiResponse(description='Invalid credentials'),
        },
        examples=[
            OpenApiExample(
                'Login Example',
                value={
                    'email': 'user@example.com',
                    'password': 'SecurePass123!'
                },
                request_only=True,
            ),
        ]
    )
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

    @extend_schema(
        tags=['Authentication'],
        request=RefreshRequestSerializer,
        responses={
            200: OpenApiResponse(description='Token refreshed successfully'),
            401: OpenApiResponse(description='Invalid or expired token'),
        },
        examples=[
            OpenApiExample(
                'Refresh Token Example',
                value={
                    'refresh': 'eyJ0eXAiOiJKV1QiLCJhbGc...'
                },
                request_only=True,
            ),
        ]
    )
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

    @extend_schema(
        tags=['Authentication'],
        request=LogoutRequestSerializer,
        responses={
            205: OpenApiResponse(description='Logout successful'),
            400: OpenApiResponse(description='Invalid token'),
        },
        examples=[
            OpenApiExample(
                'Logout Example',
                value={
                    'refresh': 'eyJ0eXAiOiJKV1QiLCJhbGc...'
                },
                request_only=True,
            ),
        ]
    )
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

    @extend_schema(
        tags=['User'],
        responses={
            200: UserSerializer,
            401: OpenApiResponse(description='Unauthorized'),
        },
    )
    def get(self, request):
        serializer = UserSerializer(request.user)
        return api_response(
            data=serializer.data,
            status=status.HTTP_200_OK
        )