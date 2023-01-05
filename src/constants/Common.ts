export enum TaskType {
    bug = 0,
    features = 1,
}

export enum MapLabelTaskType {
    value0 = "Bug",
    value1 = "Feature"
}

export const ProcessStep  = {
    open :{
        value: 0,
        color: "green"
    },
    pending :{
        value: 1,
        color: "orange"
    },
    close:{
        value: 2,
        color: "red"
    }
}

export enum MapLabelProcessStep{
    value0 = "Open",
    value1 = "Pending",
    value2 = "Close"
}