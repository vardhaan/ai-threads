import React, { Fragment } from "react";


interface ArrowProps {
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
    strokeColor?: string;
    strokeWidth?: number;

}

export const Arrow = (props: ArrowProps) => {
    const DEFAULT_PARAMS = {
        strokeColor: "#000000",
        strokeWidth: 2
    }
    
    const markerID = `${props.fromX}-${props.fromY}-${props.toX}-${props.toY}-arrowhead`

    return (
        <Fragment>
            <defs>
                <marker
                    id={markerID}
                    markerWidth="10"
                    markerHeight="7"
                    refX="10"
                    refY="3.5"
                    orient="auto"
                >
                    <polygon points="0 0, 10 3.5, 0 7" fill={props.strokeColor ?? DEFAULT_PARAMS.strokeColor} />
                </marker>
            </defs>
            <line 
                x1={props.fromX}
                y1={props.fromY}
                x2={props.toX}
                y2={props.toY}
                stroke={props.strokeColor ?? DEFAULT_PARAMS.strokeColor}
                strokeWidth={props.strokeWidth ?? DEFAULT_PARAMS.strokeWidth}
                markerEnd={`url(#${markerID})`}
            />
        </Fragment>
    )
}