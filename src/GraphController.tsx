import React, { useEffect, useState } from "react";
import { ChatBox } from "./components/ChatBox";
import { Box, Button } from "@mui/joy";
import { Arrow } from "./components/Arrow";
import { CHATBOX_WIDTH, ModelTypes, QueryResponsePair } from "./constants";
import { LLMChatParams } from "./llm/LLMChat";
import { ParamSelector } from "./components/ParamSelector";

/**
 * This page controls the CRUD of nodes and edges.
 * - This component tracks the ids and positions of nodes. It also passes down handler functions.
 * - This component tracks the movement of nodes.
 * - This component creates and tracks edges between nodes.
 */

interface GraphControllerProps {
    useLocalStorage: boolean; //read and write nodes and edges from local storage
}


export const GraphController = (props: GraphControllerProps) => {
    const DEFAULT_LLM_CHAT_PARAMS: LLMChatParams = {
        model: ModelTypes.Llama_3_8b,
        temperature: 1,
        maxResponseLength: 2000,
        stream: true
    }

    const [nodes, setNodes] = useState<Node[]>([])
    const [edges, setEdges] = useState<Edge[]>([])
    const [nodeIDCount, setNodeIDCount] = useState(0)
    const [llmChatParams, setllmChatParams] = useState<LLMChatParams>(DEFAULT_LLM_CHAT_PARAMS)

    const NULL_PARENT_ID = "-1";
    const LOCAL_STORAGE_NODES = "nodes"
    const LOCAL_STORAGE_EDGES = "edges"
    const LOCAL_STORAGE_NODE_ID_COUNT = "nodeIDCount"

    

    const readDataFromLocalStorage = () => {
        const storedNodes = localStorage.getItem(LOCAL_STORAGE_NODES)
        const storedEdges = localStorage.getItem(LOCAL_STORAGE_EDGES)
        const storedNodeIDCount = localStorage.getItem(LOCAL_STORAGE_NODE_ID_COUNT)
        
        if (storedNodes) setNodes(JSON.parse(storedNodes));
        if (storedEdges) setEdges(JSON.parse(storedEdges));
        if (storedNodeIDCount) setNodeIDCount(JSON.parse(storedNodeIDCount));
    }


    const saveDataToLocalStorage = () => {
        if (nodeIDCount === 0) {
            return
        }
        localStorage.setItem(LOCAL_STORAGE_NODES, JSON.stringify(nodes))
        localStorage.setItem(LOCAL_STORAGE_EDGES, JSON.stringify(edges))
        localStorage.setItem(LOCAL_STORAGE_NODE_ID_COUNT, JSON.stringify(nodeIDCount))
    }

    const onPositionChange = (id: string, xPosition: number, yPosition: number) => {
        setNodes(prevNodes => prevNodes.map(node => {
            if (node.ID === id) {
                return {...node, positionX: xPosition, positionY: yPosition}
            } else {
                return node
            }
        }));
    }

    useEffect(() => {
        console.log(nodes)
    }, [nodes])

    useEffect(() => {
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            if (props.useLocalStorage) {
                saveDataToLocalStorage();
            }
        };
        console.log("ls val changed", props.useLocalStorage)
        window.addEventListener("beforeunload", handleBeforeUnload);
    
        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [props.useLocalStorage]);

    useEffect(() => {
        if (props.useLocalStorage) {
            readDataFromLocalStorage();
        }
    }, [])

    useEffect(() => {
        if (props.useLocalStorage) {
            saveDataToLocalStorage();
        }
    }, [nodes, edges, nodeIDCount]);

    const addNode = (parentID: string) => {
        const newNodeID = `${nodeIDCount}`

        const noParent = parentID === NULL_PARENT_ID
        const parentNode = nodes.find(n => n.ID === parentID)
        if (noParent || parentNode === undefined) {
            const node: Node = {
                ID: newNodeID,
                parentID: NULL_PARENT_ID,
                positionX: 0, //TODO: add to an unoccupied place
                positionY: 0,
                query: "",
                response: "",
            }
            setNodes([...nodes, node])
        } else {
            const parentX = parentNode.positionX
            const parentY = parentNode.positionY
            const node: Node = {
                ID: newNodeID,
                parentID: parentID,
                positionX: parentX + 200,
                positionY: parentY + 200,
                query: "",
                response: ""
            }
            setNodes([...nodes, node])
            const edge: Edge = {
                fromID: parentID,
                toID: newNodeID
            }
            setEdges([...edges, edge])
        }
        setNodeIDCount(prev => prev+1)
    }

    useEffect(() => {
        console.log(edges)
    }, [edges])

    const getEdgeArrow = (edge: Edge, xOffset: number = (16+2+CHATBOX_WIDTH)/2) => {
        const fromNode = nodes.find(n => n.ID === edge.fromID)
        const toNode = nodes.find(n => n.ID === edge.toID)
        if (fromNode && toNode) {
            return <Arrow 
                key={`${edge.fromID}-${edge.toID}`}
                fromX={fromNode.positionX + xOffset}
                fromY={fromNode.positionY}
                toX={toNode.positionX + xOffset}
                toY={toNode.positionY}
            />
        }
        return null
    }

    const onQueryChange = (nodeID: string, newQuery: string) => {
        setNodes(prevNodes => prevNodes.map(node => {
            if (node.ID === nodeID) {
                return {...node, query: newQuery}
            }
            return node
        }));
    }

    const onResponseChange = (nodeID: string, newResponse: string) => {
        setNodes(prevNodes => prevNodes.map(node => {
            if (node.ID === nodeID) {
                return {...node, response: newResponse}
            }
            return node
        }));
    }


    const getNodeAncestorQueryResponse = (parentID: string) => {
        if (parentID === "-1") {
            return [] as QueryResponsePair[]
        }
        const node = nodes.find(node => node.ID === parentID)
        if (node === undefined) {
            return [] as QueryResponsePair[]
        }
        const recurseResult: QueryResponsePair[] = getNodeAncestorQueryResponse(node.parentID)
        const qrPair: QueryResponsePair = {
            query: node.query,
            response: node.response
        }
        recurseResult.push(qrPair)
        return recurseResult
    }

    const clearData = () => {
        setNodes([])
        setEdges([])
        setNodeIDCount(0)
    }

    return (
        <Box width={"100vw"} height={"100vh"}>
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "row"
                }}
            >
                <Button
                    onClick={() => addNode("-1")}
                >
                    Add node
                </Button>
                <Button
                    color="danger"
                    onClick={() => clearData()}
                >
                    Clear all nodes
                </Button>
            </Box>
            
            {nodes.map(node => {
                return <ChatBox 
                    key={node.ID}
                    ID={node.ID}
                    query={node.query}
                    response={node.response}
                    parentID={node.parentID}
                    onPositionChange={onPositionChange}
                    addNewChild={addNode}
                    positionX={node.positionX}
                    positionY={node.positionY}
                    onQueryChange={onQueryChange}
                    onResponseChange={onResponseChange}
                    getHistory={getNodeAncestorQueryResponse}
                    llmChatParams={llmChatParams}
                />
            })}
            <svg width={"100%"} height={"100%"}>
                {edges.map(edge => {
                    return getEdgeArrow(edge) 
                })}
            </svg>
            <Box
            sx={{
                position: "fixed",
                bottom: 0,
                left: 0,
                padding: 1
            }}>
                <ParamSelector
                    params={llmChatParams}
                    onParamUpdate={newParams => setllmChatParams(newParams)}
                />
            </Box>
        </Box>
    )
}

interface Node {
    ID: string;
    parentID: string;
    positionX: number;
    positionY: number;
    query: string;
    response: string;
}

interface Edge {
    fromID: string;
    toID: string;
}