from django.shortcuts import render
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.throttling import ScopedRateThrottle
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.conf import settings
from drf_spectacular.utils import extend_schema, OpenApiResponse, OpenApiExample
from drf_spectacular.types import OpenApiTypes
from rest_framework import serializers as drf_serializers
from .serializers import RegisterSerializer, UserSerializer
from core.utils import api_response

User = get_user_model()


class LoginRequestSerializer(drf_serializers.Serializer):
    email = drf_serializers.EmailField()
    password = drf_serializers.CharField(write_only=True)


class TokenResponseSerializer(drf_serializers.Serializer):
    access = drf_serializers.CharField()


class LoginResponseSerializer(drf_serializers.Serializer):
    user = UserSerializer()
    tokens = TokenResponseSerializer()


class RefreshRequestSerializer(drf_serializers.Serializer):
    pass


class LogoutRequestSerializer(drf_serializers.Serializer):
    pass


class RegisterView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'auth_register'

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
            
            response = api_response(
                data={
                    'user': UserSerializer(user).data,
                    'tokens': {
                        'access': str(refresh.access_token),
                    }
                },
                meta={'message': 'User registered successfully'},
                status=status.HTTP_201_CREATED
            )
            
            response.set_cookie(
                key='refresh_token',
                value=str(refresh),
                httponly=True,
                secure=not settings.DEBUG,
                samesite='Lax',
                path='/api/v1/auth/',
                max_age=7 * 24 * 60 * 60,  # 7 days
            )
            return response
        
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
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'auth_login'

    @extend_schema(
        tags=['Authentication'],
        request=LoginRequestSerializer,
        responses={
            200: OpenApiResponse(description='Login successful'),
            401: OpenApiResponse(description='Invalid credentials'),
            429: OpenApiResponse(description='Too many failed login attempts'),
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
        email = request.data.get('email')
        if email:
            cache_key = f"lockout:{email}"
            failures = cache.get(cache_key, 0)
            if failures >= 5:
                return api_response(
                    errors=[{
                        'field': 'credentials',
                        'detail': 'Account temporarily locked due to too many failed login attempts. Please try again in 15 minutes.'
                    }],
                    status=status.HTTP_429_TOO_MANY_REQUESTS
                )

        serializer = self.get_serializer(data=request.data)
        
        from rest_framework.exceptions import ValidationError, AuthenticationFailed
        try:
            serializer.is_valid(raise_exception=True)
        except (InvalidToken, ValidationError, AuthenticationFailed):
            if email:
                cache_key = f"lockout:{email}"
                failures = cache.get(cache_key, 0)
                cache.set(cache_key, failures + 1, timeout=900)  # 15 minutes lockout
            return api_response(
                errors=[{'field': 'credentials', 'detail': 'Invalid email or password'}],
                status=status.HTTP_401_UNAUTHORIZED
            )
        except Exception as e:
            return api_response(
                errors=[{'detail': str(e)}],
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if email:
            cache.delete(f"lockout:{email}")
            
        user = User.objects.get(email=request.data.get('email'))
        access = serializer.validated_data['access']
        refresh = serializer.validated_data['refresh']
        
        response = api_response(
            data={
                'user': UserSerializer(user).data,
                'tokens': {
                    'access': access,
                }
            },
            meta={'message': 'Login successful'},
            status=status.HTTP_200_OK
        )
        
        response.set_cookie(
            key='refresh_token',
            value=refresh,
            httponly=True,
            secure=not settings.DEBUG,
            samesite='Lax',
            path='/api/v1/auth/',
            max_age=7 * 24 * 60 * 60,  # 7 days
        )
        
        return response


class RefreshTokenView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'auth_refresh'  # Separate from login — called silently on every page load

    @extend_schema(
        tags=['Authentication'],
        request=RefreshRequestSerializer,
        responses={
            200: OpenApiResponse(description='Token refreshed successfully'),
            401: OpenApiResponse(description='Invalid or expired token'),
        }
    )
    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get('refresh_token')
        if not refresh_token:
            return api_response(
                errors=[{'code': 'token_not_found', 'detail': 'Refresh token not found in cookies'}],
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        try:
            token = RefreshToken(refresh_token)
            user_id = token['user_id']
            user = User.objects.get(id=user_id)
        except (TokenError, User.DoesNotExist):
            response = api_response(
                errors=[{'code': 'token_expired', 'detail': 'Refresh token is invalid or expired'}],
                status=status.HTTP_401_UNAUTHORIZED
            )
            response.delete_cookie('refresh_token', path='/api/v1/auth/')
            return response
        
        # Blacklist old token
        try:
            token.blacklist()
        except Exception:
            pass
        
        # Issue new token pair
        new_refresh = RefreshToken.for_user(user)
        
        response = api_response(
            data={
                'user': UserSerializer(user).data,
                'tokens': {
                    'access': str(new_refresh.access_token),
                }
            },
            meta={'message': 'Token refreshed successfully'},
            status=status.HTTP_200_OK
        )
        
        response.set_cookie(
            key='refresh_token',
            value=str(new_refresh),
            httponly=True,
            secure=not settings.DEBUG,
            samesite='Lax',
            path='/api/v1/auth/',
            max_age=7 * 24 * 60 * 60,  # 7 days
        )
        
        return response


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=['Authentication'],
        request=LogoutRequestSerializer,
        responses={
            205: OpenApiResponse(description='Logout successful'),
        }
    )
    def post(self, request):
        refresh_token = request.COOKIES.get('refresh_token')
        
        response = api_response(
            meta={'message': 'Logout successful'},
            status=status.HTTP_205_RESET_CONTENT
        )
        response.delete_cookie('refresh_token', path='/api/v1/auth/')
        
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except Exception:
                pass
            
        return response


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


class UserSearchView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=['User'],
        summary='Search users by email or name',
        description='Search users by query string. Returns matching users excluding the current user.',
        responses={
            200: UserSerializer(many=True),
        }
    )
    def get(self, request):
        from django.db.models import Q
        query = request.query_params.get('q', '').strip()
        if not query or len(query) < 2:
            return api_response(data=[])
            
        users = User.objects.filter(
            Q(email__icontains=query) |
            Q(first_name__icontains=query) |
            Q(last_name__icontains=query)
        ).exclude(id=request.user.id)[:10]
        
        serializer = UserSerializer(users, many=True)
        return api_response(data=serializer.data)