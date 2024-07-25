import React from 'react';
import { LLMChatParams } from '../llm/LLMChat';
import { Box, Option, Select, Slider, Typography, Checkbox } from '@mui/joy';
import { ModelTypes } from '../constants';


/**
 * 
 * Skipping temperature selector for now.
 */

interface ParamSelectorProps {
    params: LLMChatParams;
    onParamUpdate: (newParams: LLMChatParams) => void;
}

export const ParamSelector = (props: ParamSelectorProps) => {

    const onModelChange = (event: React.SyntheticEvent | null, newVal: string | null) => {
        const newParams = {...props.params, model: newVal as ModelTypes}
        props.onParamUpdate(newParams)
    } 

    const onResponseLengthChange = (event: Event | React.SyntheticEvent<Element, Event>, value: number | number[]) => {
        const newParams = {...props.params, maxResponseLength: value as number}
        props.onParamUpdate(newParams)
    }

    const onStreamChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newParams = {...props.params, stream: event.target.checked}
        props.onParamUpdate(newParams)
    }

    return (
        <Box
            sx={{
                border: "1px solid black",
                display: "flex",
                flexDirection: "row",
                gap: 2
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center"
                }}
            >
                <Typography>model</Typography>
                <Select 
                    defaultValue={props.params.model}
                    onChange={onModelChange}
                >
                    {Object.values(ModelTypes).map(model => {
                        return <Option value={model}>{model}</Option>
                    })}
                </Select>
            </Box>
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center"
                }}
            >
                <Typography>max response len</Typography>
                <Slider
                    defaultValue={props.params.maxResponseLength}
                    step={1}
                    min={1}
                    max={4000}
                    valueLabelDisplay='auto'
                    onChangeCommitted={onResponseLengthChange}
                />
            </Box>
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center"
                }}
            >
                <Typography>stream?</Typography>
                <Checkbox
                    checked={props.params.stream}
                    onChange={onStreamChange}
                />
            </Box>
            

        </Box>
    )

}
