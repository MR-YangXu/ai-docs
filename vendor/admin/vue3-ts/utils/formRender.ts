import { clone } from './adminCore';
import type { FormItemConfig } from '../components/SearchForm/types';
export function buildFormItems<Values extends object>(items: FormItemConfig<Values>[]): FormItemConfig<Values>[] { return clone(items); }
