interface ITDAPP {
    onEvent: (eventLabel: string) => void;
}

declare let TDAPP: ITDAPP;