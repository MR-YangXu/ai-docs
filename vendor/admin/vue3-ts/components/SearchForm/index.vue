<template>
  <div @submit.prevent.stop="submitForm">
    <ElForm
      ref="form"
      class="ai-code-search-form"
      :model="draft"
      :disabled="disabled"
      :label-position="labelPosition"
      :label-width="labelWidth"
    >
      <div class="ai-code-search-form__fields">
        <FormItem
          v-for="item in runtimeFields"
          :key="fieldNames(item).join(':')"
          :ref="(value) => registerField(item, value)"
          :item="item"
          :form-obj="draft"
          :disabled="disabled"
          @change="change"
        >
          <template
            v-if="$slots[item.slotName ?? item.propName ?? '']"
            #default="scope"
          >
            <slot :name="item.slotName ?? item.propName" v-bind="scope" />
          </template>
        </FormItem>
        <div class="ai-code-search-form__actions">
          <slot
            name="actions"
            :submit="submitForm"
            :reset="resetForm"
            :form="getFormData()"
            :busy="loading || validating"
          >
            <ElButton
              v-if="showButton"
              native-type="submit"
              type="primary"
              :loading="loading || validating"
            >
              搜索
            </ElButton>
            <ElButton
              v-if="showButton && isShowReset"
              native-type="button"
              @click="resetForm"
            >
              重置
            </ElButton>
          </slot>
          <slot name="actions-extra" :form="getFormData()" />
        </div>
      </div>
    </ElForm>
  </div>
</template>
<script setup lang="ts" generic="Values extends object">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';
import { ElButton, ElForm } from 'element-plus';
import type { FormInstance } from 'element-plus';
import type { ComponentPublicInstance } from 'vue';
import type { ValidateFieldsError } from 'async-validator';
import type { FormModel, RuntimeFormItem, SearchFormProps } from './types';
import { clone, same, fieldNames } from './values';
import FormItem from './components/FormItem.vue';
import './style.scss';
const props = withDefaults(defineProps<SearchFormProps<Values>>(), {
  showButton: true,
  isShowReset: true,
  labelPosition: 'left',
});
const emit = defineEmits<{
  submitForm: [values: Partial<Values>];
  resetForm: [values: Partial<Values>];
  formChange: [values: Partial<Values>];
}>();
const form = ref<FormInstance>();
const draft = ref<FormModel>({});
const fieldRefs = new Map<string, InstanceType<typeof FormItem>>();
function registerField(
  item: RuntimeFormItem,
  value: Element | ComponentPublicInstance | null,
) {
  for (const name of fieldNames(item)) {
    if (value && 'validate' in value)
      fieldRefs.set(name, value as InstanceType<typeof FormItem>);
    else fieldRefs.delete(name);
  }
}
const selectedFields = (
  fields?: Parameters<FormInstance['validateField']>[0],
) => {
  const requested =
    fields === undefined || (Array.isArray(fields) && !fields.length)
      ? names.value
      : Array.isArray(fields)
        ? fields
        : [fields];
  const keys = requested.map((name) =>
    Array.isArray(name) ? name.join('.') : name,
  );
  return [
    ...new Set(
      keys
        .map((name) => fieldRefs.get(name))
        .filter((value): value is InstanceType<typeof FormItem> => !!value),
    ),
  ];
};
const clearValidate: FormInstance['clearValidate'] = (fields) => {
  selectedFields(fields).forEach((field) => field.clearValidate());
};
const validateField: FormInstance['validateField'] = async (
  fields,
  callback,
) => {
  const ticket = version;
  const results = await Promise.all(
    selectedFields(fields).map((field) => field.validate()),
  );
  if (disposed || ticket !== version) return false;
  const errors: ValidateFieldsError = {};
  for (const result of results)
    for (const error of result) {
      const name = error.field ?? '';
      (errors[name] ??= []).push(error);
    }
  const valid = !Object.keys(errors).length;
  if (callback) {
    await callback(valid, valid ? undefined : errors);
    return valid;
  }
  if (!valid) throw errors;
  return true;
};
const validate: FormInstance['validate'] = (callback) =>
  validateField(undefined, callback);
const runtimeFields = computed(() => props.formHeader as RuntimeFormItem[]);
const names = computed(() => runtimeFields.value.flatMap(fieldNames));
const baseline = new Map<string, unknown>();
let schema = new Map<string, string>();
let previousSource: Partial<Values> | undefined;
let previousModel: FormModel = {};
let version = 0,
  disposed = false;
const validating = ref(false);
const invalidate = () => {
  version++;
  validating.value = false;
};
const getFormData = () =>
  Object.fromEntries(
    names.value.map((name) => [name, clone(draft.value[name])]),
  ) as Partial<Values>;
watch(
  () => props.formModel,
  (source) => {
    const next = (source ?? {}) as FormModel;
    for (const name of names.value) {
      if (source !== previousSource || !same(next[name], previousModel[name]))
        draft.value[name] = clone(next[name]);
    }
    previousSource = source;
    previousModel = clone(next);
    invalidate();
  },
  { immediate: true, deep: true, flush: 'sync' },
);
watch(
  runtimeFields,
  (fields) => {
    const next = new Map<string, string>();
    for (const field of fields)
      for (const name of fieldNames(field)) {
        if (!name || next.has(name))
          throw new Error(`SearchForm 字段必须有唯一名称：${name}`);
        next.set(name, field.itemType);
        if (schema.get(name) !== field.itemType) {
          const value = clone(
            (props.formModel as FormModel | undefined)?.[name],
          );
          baseline.set(name, clone(value));
          draft.value[name] = value;
        }
      }
    for (const name of schema.keys())
      if (!next.has(name)) {
        delete draft.value[name];
        baseline.delete(name);
      }
    schema = next;
    invalidate();
    clearValidate();
  },
  { immediate: true, deep: true, flush: 'sync' },
);
watch(
  draft,
  () => {
    invalidate();
    emit('formChange', getFormData());
  },
  { deep: true, flush: 'sync' },
);
function change(name: string, value: unknown) {
  if (!props.disabled && names.value.includes(name))
    draft.value[name] = clone(value);
}
async function submitForm() {
  if (
    !form.value ||
    props.disabled ||
    props.loading ||
    validating.value ||
    disposed
  )
    return false;
  const ticket = ++version;
  validating.value = true;
  try {
    try {
      if (!(await validate())) return false;
    } catch (errors) {
      if (
        ticket === version &&
        !disposed &&
        errors &&
        typeof errors === 'object'
      ) {
        const first = Object.keys(errors)[0];
        if (first) {
          form.value.scrollToField(first);
          await nextTick();
          if (ticket === version && !disposed)
            form.value
              ?.getField(first)
              ?.$el?.querySelector<HTMLElement>(
                'input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex="0"]',
              )
              ?.focus();
        }
      }
      return false;
    }
    if (disposed || ticket !== version || props.disabled || props.loading)
      return false;
    emit('submitForm', getFormData());
    return true;
  } finally {
    if (ticket === version) validating.value = false;
  }
}
function resetForm() {
  if (props.disabled) return;
  invalidate();
  for (const name of names.value) draft.value[name] = clone(baseline.get(name));
  clearValidate();
  emit('resetForm', getFormData());
  nextTick(() => clearValidate());
}
onBeforeUnmount(() => {
  disposed = true;
  invalidate();
});
defineExpose({
  submitForm,
  resetForm,
  getFormData,
  validate,
  validateField,
  clearValidate,
});
</script>
