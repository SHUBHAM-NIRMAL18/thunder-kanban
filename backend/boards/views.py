from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from django.db import transaction
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter, OpenApiResponse, OpenApiExample
from drf_spectacular.types import OpenApiTypes
from .models import Board
from .serializers import BoardSerializer, BoardDetailSerializer, BoardCreateSerializer
from core.utils import api_response
from core.permissions import IsOwner

# Create your views here.

@extend_schema_view(
    list=extend_schema(
        tags=['Boards'],
        summary='List all boards',
        description='Get a list of all boards owned by the authenticated user.',
        responses={
            200: OpenApiResponse(description='List of boards retrieved successfully'),
        }
    ),
    retrieve=extend_schema(
        tags=['Boards'],
        summary='Get board details',
        description='Get detailed information about a specific board including all columns and tasks.',
        responses={
            200: OpenApiResponse(description='Board details retrieved successfully'),
            404: OpenApiResponse(description='Board not found'),
        }
    ),
    create=extend_schema(
        tags=['Boards'],
        summary='Create a new board',
        description='Create a new Kanban board. Default columns (To Do, In Progress, Done) will be created automatically.',
        request=BoardCreateSerializer,
        responses={
            201: OpenApiResponse(description='Board created successfully'),
            400: OpenApiResponse(description='Validation error'),
        },
        examples=[
            OpenApiExample(
                'Create Board',
                value={'name': 'My Project', 'description': 'A board for tracking project tasks'},
                request_only=True,
            ),
        ]
    ),
    update=extend_schema(
        tags=['Boards'],
        summary='Update board',
        description='Update board name and/or description.',
        responses={
            200: OpenApiResponse(description='Board updated successfully'),
            400: OpenApiResponse(description='Validation error'),
            404: OpenApiResponse(description='Board not found'),
        }
    ),
    partial_update=extend_schema(
        tags=['Boards'],
        summary='Partially update board',
        description='Partially update board fields.',
        responses={
            200: OpenApiResponse(description='Board updated successfully'),
            400: OpenApiResponse(description='Validation error'),
            404: OpenApiResponse(description='Board not found'),
        }
    ),
    destroy=extend_schema(
        tags=['Boards'],
        summary='Delete board',
        description='Soft delete a board. The board can be recovered later.',
        responses={
            200: OpenApiResponse(description='Board deleted successfully'),
            404: OpenApiResponse(description='Board not found'),
        }
    ),
)
class BoardViewSet(viewsets.ModelViewSet):
    serializer_class = BoardSerializer
    permission_classes = [IsAuthenticated, IsOwner]

    def get_queryset(self):
        return Board.objects.filter(
            owner=self.request.user,
            is_archived=False
        ).prefetch_related('columns__tasks')

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return BoardDetailSerializer
        if self.action == 'create':
            return BoardCreateSerializer
        return BoardSerializer

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return api_response(
            data=serializer.data,
            meta={"count": queryset.count()}
        )

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = BoardDetailSerializer(instance)
        return api_response(data=serializer.data)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        self._create_default_columns(serializer.instance)
        
        return api_response(
            data=BoardDetailSerializer(serializer.instance).data,
            meta={"message": "Board created successfully"},
            status=status.HTTP_201_CREATED
        )

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = BoardSerializer(instance, data=request.data, partial=partial, context={'request': request})
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return api_response(
            data=serializer.data,
            meta={"message": "Board updated successfully"}
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.is_archived = True
        instance.save()
        return api_response(
            meta={"message": "Board deleted successfully"},
            status=status.HTTP_200_OK
        )

    @extend_schema(
        tags=['Boards'],
        summary='Duplicate board',
        description='Create a copy of an existing board including all columns and tasks.',
        responses={
            201: OpenApiResponse(description='Board duplicated successfully'),
            404: OpenApiResponse(description='Board not found'),
        }
    )
    @action(detail=True, methods=['post'])
    def duplicate(self, request, pk=None):
        original_board = self.get_object()
        
        base_name = f"{original_board.name} (Copy)"
        new_name = base_name
        counter = 1
        while Board.objects.filter(owner=request.user, name=new_name, is_archived=False).exists():
            counter += 1
            new_name = f"{original_board.name} (Copy {counter})"
        
        with transaction.atomic():
            new_board = Board.objects.create(
                owner=request.user,
                name=new_name,
                description=original_board.description
            )
            
            for column in original_board.columns.all().order_by('position'):
                from columns.models import Column
                new_column = Column.objects.create(
                    board=new_board,
                    name=column.name,
                    position=column.position
                )
                
                for task in column.tasks.filter(is_archived=False).order_by('position'):
                    from tasks.models import Task
                    Task.objects.create(
                        column=new_column,
                        title=task.title,
                        description=task.description,
                        position=task.position,
                        priority=task.priority,
                        due_date=task.due_date
                    )
        
        return api_response(
            data=BoardDetailSerializer(new_board).data,
            meta={"message": "Board duplicated successfully"},
            status=status.HTTP_201_CREATED
        )

    def _create_default_columns(self, board):
        from columns.models import Column
        default_columns = [
            {'name': 'To Do', 'position': 0},
            {'name': 'In Progress', 'position': 1},
            {'name': 'Done', 'position': 2},
        ]
        Column.objects.bulk_create([
            Column(board=board, **col) for col in default_columns
        ])