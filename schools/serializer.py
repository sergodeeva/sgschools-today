from django.core import serializers

GeoJSONSerializer = serializers.get_serializer('geojson')


class Serializer(GeoJSONSerializer):
    def get_dump_object(self, obj):
        data = super(Serializer, self).get_dump_object(obj)
        data.update(school_type=obj.__class__.__name__)

        return data
