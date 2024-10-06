import React, { useState, useEffect, lazy, Suspense } from 'react';
import { CHATBOX_WIDTH, ModelTypes, QueryResponsePair } from '../constants';
import { Box, Button, CircularProgress, IconButton, Input, Typography } from '@mui/joy';
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { LLMChat, LLMChatParams } from '../llm/LLMChat';

const ReactMarkdown = lazy(() => import('react-markdown'));


interface ChatBoxProps {
    ID: string;
    query: string;
    response: string;
    parentID: string;
    // childrenIDs: string[];
    positionX: number;
    positionY: number;
    onPositionChange: (id: string, xPos: number, yPos: number) => void
    getHistory: (parentID: string) => QueryResponsePair[];
    addNewChild: (parentID: string) => void;
    // removeParent: (ID: string, parentID: string) => string;
    onQueryChange: (nodeID: string, newQuery: string) => void;
    onResponseChange: (nodeID: string, newResponse: string) => void;
    llmChatParams: LLMChatParams
    delete: (nodeID: string) => void;
}

/**
 * 
 * Box needs to:
 * - Move around/be draggable
 * - Show an input box of some kind for a user query
 * - Once query is entered, render some sort of loading screen
 * - Once LLM responds, render the query and response. (Should response stream?)
 * - Maintain some info about its parent and/or children
 * - Have a spawn button to add a new node linked to it.
 */
export const ChatBox = (props: ChatBoxProps) => {
    const [query, setQuery] = useState(props.query)
    const [response, setResponse] = useState(props.response)
    const [displayResponse, setDisplayResponse] = useState(props.response!=="")

    const onQueryChange = (newQuery: string) => {
        setQuery(newQuery)
        props.onQueryChange(props.ID, newQuery)
    }

    const onQuerySubmit = async () => {
        const priorMessages = props.getHistory(props.parentID)
        setDisplayResponse(true)
        const llmChatProps = {
            prompt: query,
            priorMessages: priorMessages,
            params: props.llmChatParams
        }
        const responseStream = LLMChat(llmChatProps)     
        const handleResponseStream = async () => {
            for await (const chunk of responseStream) {
                if (chunk != null) {
                    setResponse(prev => {
                        const updatedResponse = prev + chunk;
                        props.onResponseChange(props.ID, updatedResponse);
                        return updatedResponse;
                    })
                }
            }
        }

        
        handleResponseStream()
        // const newResponse = "This is the response for now"
        // setResponse(newResponse)
        // props.onResponseChange(props.ID, newResponse)
    }

    const onPositionChange = (xPosition: number, yPosition: number) => {
        props.onPositionChange(props.ID, xPosition, yPosition)
    }

    const addNewChild = () => {
        props.addNewChild(props.ID)
    }

    const deleteNode = () => {
        props.delete(props.ID)
    }

    return (
            <ChatBoxDisplay
                query={query}
                response={response}
                onQueryChange={onQueryChange}
                onQuerySubmit={onQuerySubmit}
                displayResponse={displayResponse}
                onPositionChange={onPositionChange}
                addNewChild={addNewChild}
                positionX={props.positionX}
                positionY={props.positionY}
                delete={deleteNode}
            />
    )

}

interface ChatBoxDisplayProps {
    query: string;
    response: string;
    onQueryChange: (newQuery: string) => void;
    onQuerySubmit: () => void;
    displayResponse: boolean;
    onPositionChange: (newPositionX: number, newPositionY: number) => void;
    addNewChild: () => void;
    positionX: number;
    positionY: number;
    delete: () => void;
}

const ChatBoxDisplay = (props: ChatBoxDisplayProps) => {
    
    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        props.onQuerySubmit();
    }

    const handleDrag = (e: DraggableEvent, data: DraggableData) => {
        props.onPositionChange(data.x, data.y)
    }

    return (
        <Draggable 
            handle=".drag" 
            onDrag={handleDrag}
            defaultPosition={{x: props.positionX, y: props.positionY}}
        >
            <Box
                sx={{
                    border: "1px solid black",
                    padding: 1,
                    paddingTop: 0,
                    position: 'absolute',
                    width: CHATBOX_WIDTH,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-start",
                    alignItems: "center",
                    backgroundColor: "white"
                }}
            >
                <Box 
                    className="drag" 
                    sx={{ 
                        transform: 'rotate(90deg)',
                        cursor: "pointer"
                    }}
                >
                    <DragIndicatorIcon />
                </Box>
                {!props.displayResponse && <Box>
                    <form
                        onSubmit={handleSubmit}
                    >
                        <Input
                            value={props.query}
                            onChange={e => props.onQueryChange(e.target.value)}
                            placeholder='Type your query' 
                        />
                    </form>
                </Box>}
                {props.displayResponse && <Box>
                    <Box
                        sx={{
                            border: "1px solid green",
                        }}
                    >
                        <Typography>
                            {props.query}
                        </Typography>
                    </Box>
                    <Box
                        sx={{ 
                            border: "1px solid red",
                         }}
                    >
                        {props.response === "" && <CircularProgress />}
                        {props.response !== "" && 
                        <Box
                            sx={{
                                maxHeight: 400, // Adjust the height as needed
                                overflowY: 'auto',
                                maxWidth: 190
                            }}
                        >
                            <Suspense fallback={<CircularProgress />}>
                                <ReactMarkdown>
                                    {props.response}
                                </ReactMarkdown>
                            </Suspense>
                        </Box>}
                    </Box>
                    <Box>
                        <Button
                            onClick={() => props.addNewChild()}
                        >
                            Add
                        </Button>
                        <Button
                            onClick={() => props.delete()}
                            color="danger"
                        >
                            Delete
                        </Button>
                    </Box>
                </Box>}
                
            </Box>
        </Draggable>
    )
}
