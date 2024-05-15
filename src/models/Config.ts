export interface DeviceConfigField {
    field_name: string
    value: string | undefined
}

export interface DeviceConfigFieldTemplate {
    id: number
    field_name: string
    value_type: string
    default_value?: string
    is_optional: boolean
    regexp: string
    field_description: string
}

export interface DeviceConfigFieldRead {
    value: string
    field_name: string
    type: string
    description: string
}
