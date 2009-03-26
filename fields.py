# -*- coding: utf-8 -*-

from django.db import connection, models
from django.db.models.signals import post_delete, post_save


qn = connection.ops.quote_name


class PositionField(models.IntegerField):
    """A model field to manage the position of an item within a collection.

    By default all instances of a model are treated as one collection; if the
    ``unique_for_field`` argument is used, each value of the specified field is
    treated as a distinct collection.

    ``PositionField`` values work like list indices, including the handling of
    negative values.  A value of ``-2`` will be cause the position to be set to
    the second to last position in the collection.  The implementation differs
    from standard list indices in that values that are too large or too small
    are converted to the maximum or minimum allowed value respectively.

    When the value of a ``PositionField`` in a model instance is modified, the
    positions of other instances in the same collection are automatically
    updated to reflect the change.

    Assigning a value of ``None`` to a ``PositionField`` will cause the instance
    to be moved to the end of the collection (or appended to the collection, in
    the case of a new instance).

    """
    def __init__(self, verbose_name=None, name=None, unique_for_field=None,
                 *args, **kwargs):
        # blank values are used to move an instance to the last position
        kwargs.setdefault('blank', True)

        # unique constraints break the ability to execute a single query to
        # increment or decrement a set of positions; they also require the use
        # of temporary placeholder positions which result in undesirable
        # additional queries
        unique = kwargs.get('unique', False)
        if unique:
            raise TypeError(
                '%s cannot have a unique constraint' % self.__class__.__name__
            )
        # TODO: raise exception if position field appears in unique_together

        super(PositionField, self).__init__(verbose_name, name, *args, **kwargs)
        self.unique_for_field = unique_for_field

    def contribute_to_class(self, cls, name):
        super(PositionField, self).contribute_to_class(cls, name)

        # use this object as the descriptor for field access
        setattr(cls, self.name, self)

        # adjust related positions in response to a delete or save
        post_delete.connect(self._on_delete, sender=cls)
        post_save.connect(self._on_save, sender=cls)

    def get_internal_type(self):
        # all values will be positive after pre_save
        return 'PositiveIntegerField'

    def pre_save(self, model_instance, add):
        current, updated = self._get_instance_cache(model_instance)

        # existing instance, position not modified; no cleanup required
        if current is not None and updated is None:
            self._reset_instance_cache(model_instance, current)
            return current

        count = self._get_instance_peers(model_instance).count()
        if current is None:
            max_position = count
        else:
            max_position = count - 1
        min_position = 0

        # new instance; appended; no cleanup required
        if current is None and (updated == -1 or updated >= max_position):
            self._reset_instance_cache(model_instance, max_position)
            return max_position

        if max_position >= updated >= min_position:
            # positive position; valid index
            position = updated
        elif updated > max_position:
            # positive position; invalid index
            position = max_position
        elif abs(updated) <= (max_position + 1):
            # negative position; valid index

            # add 1 to max_position to make this behave like a negative list
            # index.  -1 means the last position, not the last position minus 1

            position = max_position + 1 + updated
        else:
            # negative position; invalid index
            position = min_position

        # instance inserted; cleanup required on post_save
        self._set_instance_cache(model_instance, position)
        return position

    def __get__(self, instance, owner):
        if instance is None:
            raise AttributeError('%s must be accessed via instance' % self.name)
        current, updated = self._get_instance_cache(instance)
        if updated is None:
            return current
        return updated

    def __set__(self, instance, value):
        if instance is None:
            raise AttributeError('%s must be accessed via instance' % self.name)
        self._set_instance_cache(instance, value)

    def _get_instance_cache(self, instance):
        try:
            current, updated = getattr(instance, self.get_cache_name())
        except (AttributeError, TypeError):
            current, updated = None, None
        return current, updated

    def _reset_instance_cache(self, instance, value):
        try:
            delattr(instance, self.get_cache_name())
        except AttributeError:
            pass
        setattr(instance, self.get_cache_name(), (value, None))

    def _set_instance_cache(self, instance, value):
        # TODO: Find a more robust way to determine if instance exists in
        # the db; this is necessary because the position field won't be
        # initialized to None when models.Manager.create is called with an
        # explicit position.

        # FIXME: This breaks pre-newforms-admin when setting a position gt the
        # maximum possible position -- something about how models are
        # instantiated keeps this method from doing the right thing.
        # Fortunately it works on newforms-admin, so it will be moot soon.

        has_pk = bool(getattr(instance, instance._meta.pk.attname))

        # default to None for existing instances; -1 for new instances
        #updated = None if has_pk else -1
        if has_pk:
            updated = None
        else:
            updated = -1

        try:
            current = getattr(instance, self.get_cache_name())[0]
        except (AttributeError, TypeError):
            if has_pk:
                current = value
            else:
                current = None
                if value is not None:
                    updated = value
        else:
            if value is None:
                updated = -1
            elif value != current:
                updated = value

        setattr(instance, self.get_cache_name(), (current, updated))

    def _get_instance_peers(self, instance):
        # return a queryset containing all instances of the model that belong
        # to the same collection as instance; either all instances of a model
        # or all instances with the same value in unique_for_field
        filters = {}
        if self.unique_for_field:
            unique_for_field = instance._meta.get_field(self.unique_for_field)
            unique_for_value = getattr(instance, unique_for_field.attname)
            if unique_for_field.null and unique_for_value is None:
                filters['%s__isnull' % unique_for_field.name] = True
            else:
                filters[unique_for_field.name] = unique_for_value
        return instance.__class__._default_manager.filter(**filters)

    def _on_delete(self, sender, instance, **kwargs):
        current, updated = self._get_instance_cache(instance)
        
        # decrement positions gt current
        operations = [self._get_operation_sql('-')]
        conditions = [self._get_condition_sql('>', current)]

        cursor = connection.cursor()
        cursor.execute(self._get_update_sql(instance, operations, conditions))
        self._reset_instance_cache(instance, None)

    def _on_save(self, sender, instance, **kwargs):
        current, updated = self._get_instance_cache(instance)

        # no cleanup required
        if updated is None:
            return None

        if current is None:
            # increment positions gte updated
            operations = [self._get_operation_sql('+')]
            conditions = [self._get_condition_sql('>=', updated)]
        elif updated > current:
            # decrement positions gt current and lte updated
            operations = [self._get_operation_sql('-')]
            conditions = [
                self._get_condition_sql('>', current),
                self._get_condition_sql('<=', updated)
            ]
        else:
            # increment positions lt current and gte updated
            operations = [self._get_operation_sql('+')]
            conditions = [
                self._get_condition_sql('<', current),
                self._get_condition_sql('>=', updated)
            ]

        # exclude instance from the update
        conditions.append('%(pk_field)s != %(pk)s' % {
            'pk': getattr(instance, instance._meta.pk.attname),
            'pk_field': qn(instance._meta.pk.column)
        })

        cursor = connection.cursor()
        cursor.execute(self._get_update_sql(instance, operations, conditions))
        self._reset_instance_cache(instance, updated)

    def _get_update_sql(self, instance, operations=None, conditions=None):
        operations = operations or []
        conditions = conditions or []

        # TODO: add params and operations to update auto_now date(time)s

        params = {
            'position_field': qn(self.column),
            'table': qn(instance._meta.db_table),
        }
        if self.unique_for_field:
            unique_for_field = instance._meta.get_field(self.unique_for_field)
            unique_for_value = getattr(instance, unique_for_field.attname)

            params['unique_for_field'] = qn(unique_for_field.column)

            # this field is likely to be indexed; put it first
            if unique_for_field.null and unique_for_value is None:
                conditions.insert(0, '%(unique_for_field)s IS NULL')
            else:
                params['unique_for_value'] = unique_for_value
                conditions.insert(0,
                                  '%(unique_for_field)s = %(unique_for_value)s')

        query = 'UPDATE %(table)s'
        query += ' SET %s' % ', '.join(operations)
        query += ' WHERE %s' % ' AND '.join(conditions)

        return query % params

    def _get_condition_sql(self, gt_or_lt, position):
        return '%%(position_field)s %(gt_or_lt)s %(position)s' % {
            'gt_or_lt': gt_or_lt,
            'position': position
        }

    def _get_operation_sql(self, plus_or_minus):
        return """
        %%(position_field)s = (%%(position_field)s %(plus_or_minus)s 1)""" % {
            'plus_or_minus': plus_or_minus
        }
        


