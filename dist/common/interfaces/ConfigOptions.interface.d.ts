export interface ConfigOptions {
    message: string;
    returnSources: boolean;
    returnFollowUpQuestions: boolean;
    embedSourcesInLLMResponse: boolean;
    textChunkSize: number;
    textChunkOverlap: number;
    numberOfSimilarityResults: number;
    numberOfPagesToScan: number;
}
