import { clone } from './adminCore';
import type { SearchField } from '../components/SearchForm';
export function buildFormItems<Values extends object>(items: SearchField<Values>[]): SearchField<Values>[] { return clone(items); }
