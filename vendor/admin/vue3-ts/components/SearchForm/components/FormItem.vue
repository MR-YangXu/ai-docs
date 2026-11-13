<template>
  <ElFormItem
    :label="item.labelName"
    :label-width="item.labelWidth"
    :prop="field"
    :validate-status="status"
    :show-message="false"
    :class="{ 'is-required': required }"
  >
    <div
      class="ai-code-search-form__control"
      :style="{ width }"
      @focusout="validate('blur')"
    >
      <slot
        :form="formObj"
        :item="item"
        :value="formObj[field]"
        :update-value="updateValue"
        :change="updateField"
      >
        <ElInput
          v-if="item.itemType === 'text'"
          v-bind="controlProps"
          :model-value="textValue"
          @update:model-value="updateValue"
        />
        <ElInputNumber
          v-else-if="item.itemType === 'number'"
          v-bind="controlProps"
          :model-value="numberValue"
          :min="item.min"
          :max="item.max"
          :precision="item.precision"
          :step="item.step"
          @update:model-value="updateValue"
        />
        <ElSelect
          v-else-if="item.itemType === 'selectOne'"
          v-bind="controlProps"
          :model-value="selectValue"
          :multiple="item.multiple"
          :filterable="item.filterable"
          :loading="item.loading"
          :remote="item.remote"
          :remote-method="(query) => item.remoteMethod?.(query, formObj[field])"
          @update:model-value="updateValue"
        >
          <ElOption
            v-for="option in item.optionsArr"
            :key="`${typeof option.value}:${option.value}`"
            :value="option.value"
            :label="option.label"
            :disabled="option.disabled"
          />
        </ElSelect>
        <ElDatePicker
          v-else-if="
            ['date', 'dateRange', 'datetimerange'].includes(item.itemType)
          "
          v-bind="controlProps"
          :model-value="dateValue"
          :type="
            item.itemType === 'dateRange'
              ? 'daterange'
              : item.itemType === 'datetimerange'
                ? 'datetimerange'
                : 'date'
          "
          :format="item.format ?? dateFormat"
          :value-format="item.valueFormat ?? dateFormat"
          @update:model-value="updateValue"
        />
        <div
          v-else-if="item.itemType === 'inputBoxInterval'"
          class="ai-code-search-form__range"
        >
          <ElInputNumber
            v-bind="{
              ...controlProps,
              'aria-label': `${item.labelName ?? '区间'} 下限`,
            }"
            :model-value="numeric(item.propName1)"
            :min="item.min"
            :max="item.max"
            :precision="item.precision"
            @update:model-value="(value) => updateField(item.propName1!, value)"
          />
          <span>～</span>
          <ElInputNumber
            v-bind="{
              ...controlProps,
              'aria-label': `${item.labelName ?? '区间'} 上限`,
            }"
            :model-value="numeric(item.propName2)"
            :min="item.min"
            :max="item.max"
            :precision="item.precision"
            @update:model-value="(value) => updateField(item.propName2!, value)"
          />
        </div>
      </slot>
      <div
        v-if="message"
        :id="errorId"
        class="el-form-item__error"
        role="alert"
      >
        {{ message }}
      </div>
    </div>
  </ElFormItem>
</template>
<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch, useId } from 'vue';
import AsyncValidator from 'async-validator';
import type { ValidateError } from 'async-validator';
import { clone, fieldNames } from '../values';
import {
  ElDatePicker,
  ElFormItem,
  ElInput,
  ElInputNumber,
  ElOption,
  ElSelect,
} from 'element-plus';
import type { FormItemRule } from 'element-plus';
import type { RuntimeFormItem, FormModel, OptionValue } from '../types';
const props = defineProps<{
  item: RuntimeFormItem;
  formObj: FormModel;
  disabled?: boolean;
}>();
const emit = defineEmits<{ change: [field: string, value: unknown] }>();
const errorId = `search-error-${useId()}`;
const field = computed(() => props.item.propName ?? props.item.propName1!);
const width = computed(() =>
  typeof props.item.width === 'number'
    ? `${props.item.width}px`
    : (props.item.width ??
      (props.item.itemType.includes('ange') ? '280px' : '200px')),
);
const controlProps = computed(() => ({
  // Vue 会合并事件监听器，不能只依赖 v-bind 后面的属性覆盖。
  ...Object.fromEntries(
    Object.entries(props.item.controlProps ?? {}).filter(
      ([key]) =>
        ![
          'modelValue',
          'model-value',
          'value',
          'defaultValue',
          'onUpdate:modelValue',
          'onUpdate:model-value',
        ].includes(key),
    ),
  ),
  placeholder:
    props.item.placeholder ??
    (typeof props.item.controlProps?.placeholder === 'string'
      ? props.item.controlProps.placeholder
      : undefined),
  disabled: props.disabled || props.item.disabled,
  clearable: props.item.clearable !== false,
  'aria-label': props.item.labelName ?? props.item.placeholder ?? field.value,
  'aria-invalid': status.value === 'error',
  'aria-describedby': message.value ? errorId : undefined,
  'aria-required': required.value,
  validateEvent: false,
}));
const textValue = computed(() => String(props.formObj[field.value] ?? ''));
const numeric = (name?: string) =>
  typeof props.formObj[name ?? ''] === 'number'
    ? (props.formObj[name!] as number)
    : undefined;
const numberValue = computed(() => numeric(field.value));
const selectValue = computed(
  () => props.formObj[field.value] as OptionValue | OptionValue[] | undefined,
);
const dateValue = computed(
  () =>
    props.formObj[field.value] as
      | string
      | Date
      | [string, string]
      | [Date, Date]
      | undefined,
);
const dateFormat = computed(() =>
  props.item.itemType === 'datetimerange'
    ? 'YYYY-MM-DD HH:mm:ss'
    : 'YYYY-MM-DD',
);
function updateField(name: string, value: unknown) {
  if (!props.disabled && !props.item.disabled) {
    emit('change', name, value ?? undefined);
    void nextTick(() => validate('change'));
  }
}
const updateValue = (value: unknown) => updateField(field.value, value);
const empty = (value: unknown): boolean =>
  value == null ||
  (typeof value === 'string' && value.trim() === '') ||
  (Array.isArray(value) && (!value.length || value.every(empty)));
const rules = computed<FormItemRule[]>(() => {
  if (props.item.rules)
    return Array.isArray(props.item.rules)
      ? props.item.rules
      : [props.item.rules];
  return [
    {
      validator: (_rule, value, done) => {
        const item = props.item;
        const current =
          item.itemType === 'inputBoxInterval'
            ? [props.formObj[item.propName1!], props.formObj[item.propName2!]]
            : value;
        if (item.isRequired && empty(current))
          return done(new Error(`${item.labelName ?? field.value}不能为空`));
        if (
          ['inputBoxInterval', 'dateRange', 'datetimerange'].includes(
            item.itemType,
          ) &&
          !empty(current) &&
          (!Array.isArray(current) ||
            current.length !== 2 ||
            current.some(empty))
        )
          return done(new Error('请完整填写区间两端'));
        if (
          item.itemType === 'inputBoxInterval' &&
          Array.isArray(current) &&
          current.every((v) => typeof v === 'number') &&
          current[0] > current[1]
        )
          return done(new Error('下限不能大于上限'));
        done();
      },
      trigger: 'change',
    },
  ];
});
// 校验由当前字段管理，避免 UI 库中已过期的 Promise 改写最新错误状态。
const status = ref<'' | 'validating' | 'success' | 'error'>('');
const message = ref('');
const required = computed(() =>
  props.item.rules
    ? rules.value.some((rule) => rule.required)
    : !!props.item.isRequired,
);
let generation = 0,
  disposed = false;
function clearValidate() {
  generation++;
  status.value = '';
  message.value = '';
}
watch(
  () => [
    props.item,
    ...fieldNames(props.item).map((name) => props.formObj[name]),
  ],
  clearValidate,
  { deep: true, flush: 'sync' },
);
async function validate(trigger = ''): Promise<ValidateError[]> {
  const applicable = rules.value.filter(
    (rule) =>
      !trigger ||
      !rule.trigger ||
      (Array.isArray(rule.trigger)
        ? rule.trigger.includes(trigger)
        : rule.trigger === trigger),
  );
  if (disposed || !applicable.length) return [];
  const ticket = ++generation;
  status.value = 'validating';
  try {
    await new AsyncValidator({ [field.value]: applicable }).validate(
      clone(props.formObj),
      { firstFields: true, suppressValidatorError: true },
    );
    if (!disposed && ticket === generation) {
      status.value = 'success';
      message.value = '';
    }
    return [];
  } catch (reason) {
    if (disposed || ticket !== generation) return [];
    const errors: ValidateError[] =
      reason &&
      typeof reason === 'object' &&
      'errors' in reason &&
      Array.isArray(reason.errors)
        ? reason.errors
        : [
            {
              field: field.value,
              message: reason instanceof Error ? reason.message : '校验失败',
            },
          ];
    status.value = 'error';
    message.value = errors[0]?.message ?? '校验失败';
    return errors;
  }
}
onBeforeUnmount(() => {
  disposed = true;
  clearValidate();
});
defineExpose({ validate, clearValidate });
</script>
