from re import I
from rest_framework import serializers

from .models import ImageAlignment, TextAlignment, Video, VideoAlignment


class TextAlignmentSerializer(serializers.ModelSerializer):
    type = serializers.SerializerMethodField()
    source = serializers.SerializerMethodField()
    target = serializers.SerializerMethodField()

    class Meta:
        model = TextAlignment
        fields = ("id", "source", "target", "type", "alignment")

    def get_type(self, obj):
        return obj.get_type_display()

    def get_source(self, instance):
        text_id = instance.source.text.id
        witness_id = instance.source.id
        return {"text": text_id, "witness": witness_id}

    def get_target(self, instance):
        text_id = instance.target.text.id
        witness_id = instance.target.id
        return {"text": text_id, "witness": witness_id}


class ImageAlignmentSerializer(serializers.ModelSerializer):
    type = serializers.SerializerMethodField()
    source = serializers.SerializerMethodField()

    class Meta:
        model = ImageAlignment
        fields = ("id", "source", "target", "type", "alignment")

    def get_type(self, obj):
        return obj.get_type_display()

    def get_source(self, instance):
        text_id = instance.source.text.id
        witness_id = instance.source.id
        return {"text": text_id, "witness": witness_id}


class VideoAlignmentSerializer(serializers.ModelSerializer):
    type = serializers.SerializerMethodField()
    source = serializers.SerializerMethodField()

    class Meta:
        model = VideoAlignment
        fields = ("id", "source", "target", "type", "alignment")

    def get_type(self, obj):
        return obj.get_type_display()

    def get_source(self, instance):
        text_id = instance.source.text.id
        witness_id = instance.source.id
        return {"text": text_id, "witness": witness_id}


class TargetVideoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Video
