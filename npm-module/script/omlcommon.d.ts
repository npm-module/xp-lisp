export class OMLCommon {
    is_array(x: any): x is any[];
    is_bool(x: any): x is boolean;
    is_number(x: any): x is number;
    is_string(x: any): x is string;
    is_quoted(x: any): boolean;
    is_id(ast: any, name?: undefined): boolean;
    is_variable(ast: any): boolean;
    is_script(ast: any): boolean;
    is_template(ast: any): boolean;
    is_callable(ast: any): boolean;
    is_fn(ast: any): boolean;
    to_id(ast: any): any;
    id(x: any): any[];
    to_def(ast: any): any;
}
//# sourceMappingURL=omlcommon.d.ts.map