from django.db import models
from django.conf import settings
from django.core.validators import MinLengthValidator, MaxLengthValidator
from core.validators import validate_no_special_chars

# Create your models here.

class Board(models.Model):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='boards'
    )
    name = models.CharField(
        max_length=100,
        validators=[
            MinLengthValidator(1, 'Board name cannot be empty.'),
            MaxLengthValidator(100, 'Board name cannot exceed 100 characters.'),
            validate_no_special_chars,
        ]
    )
    description = models.TextField(
        blank=True,
        max_length=500,
        validators=[MaxLengthValidator(500, 'Description cannot exceed 500 characters.')]
    )
    is_archived = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['owner', 'is_archived']),
            models.Index(fields=['-created_at']),
        ]

    def __str__(self):
        return self.name

    def clean(self):
        self.name = self.name.strip()
        if self.description:
            self.description = self.description.strip()

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)