import * as React from 'react';
import {entityToPath, getStorage} from "../Utils"
import {searchIndicator, searchVulnerability} from "../QueryHelpers"
import {
    Alert, Box, Button,
    Chip,
    CircularProgress,
    Divider,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    Typography
} from '@mui/material';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import useDomEvaluator from '../hooks/useDOMEvaluator';
import {GetPageContent, MessageTypes} from "../chromeServices/types";
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';

function HomeView() {

    const [observables, setObservables] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [config, setConfig] = React.useState<any>();
    const [notConfigured, setNotConfigured] = React.useState(false);
    const [noObservablesFound, setNoObservablesFound] = React.useState(false);

    const {evaluate: getPageContent} = useDomEvaluator<GetPageContent>(
        MessageTypes.GET_CONTENT,
    );


    React.useEffect(() => {

        const fetchData = async () => new Promise<any[]>(async (resolve, reject) => {
            const items = await getPageContent();
            if (items) {
                resolve(items);
            }
        });

        getStorage().then((storage: any) => {
            if (storage.hasOwnProperty("opencti_url") && storage.hasOwnProperty("opencti_token")){
                setConfig(storage);
                fetchData().then((items: any[]) => {
                    if (items && items.length > 0){
                        setObservables(items);
                        setLoading(false);
                        items.forEach((item) => searchObservable(item, storage));
                    }else {
                        setNoObservablesFound(true);
                    }
                }).catch((err) => console.log(err));
            }
            else {
                setNotConfigured(true);
            }
            }).catch((err) => {
                setNotConfigured(true);
                console.log(err);
            });
    }, []);

    function updateObservableState(item: any) {
        const nextCounters = observables.map((counter) => {
            if (counter['value'] === item['value']) {
                return item
            } else {
                return counter;
            }
        });
        setObservables(observables => [...observables, ...nextCounters]);
    }

    function processSTIXRelations(observable: any, nodeSTIXRelations: any, storage: any) {
        for (const relation of nodeSTIXRelations) {
            if (relation['node']['to'].hasOwnProperty('entity_type')) {
                let relationId = relation['node']['to']['id'];
                observable['associations'].push({
                    entity_type: relation['node']['to']['entity_type'],
                    id: relationId,
                    name: relation['node']['to']['name'],
                    link: storage['opencti_url']+entityToPath(relation['node']['to']['entity_type']) + '/' + relationId
                });
            }
        }
        return observable;
    }

    function processReportsRelations(observable: any, nodeReports: any, storage: any) {
        for (const report of nodeReports) {
            let reportId = report['node']['id'];
            observable['associations'].push({
                entity_type: 'report',
                id: reportId,
                name: report['node']['name'],
                link: storage['opencti_url']+entityToPath('report') + '/' + reportId
            });
        }
        return observable;
    }

    async function searchObservable(observable: any, storage: any) {
        if (observable["type"] === "cve") {
            let result = await searchVulnerability(observable, storage);
            observable["state"] = "processed";
            observable["status"] = {};
            if (result["data"]["vulnerabilities"]["edges"].length === 0) {
                observable["status"] = { value: "Not Found", code: "not_found"};
            } else {
                observable['status'] = { value: 'Found', code: 'found'};
                let vulnerability_id = result['data']['vulnerabilities']['edges'][0]['node']['id'];
                observable['link'] = storage['opencti_url'] + entityToPath('vulnerability') + '/' + vulnerability_id;
                observable['labels'] = [];
                let nodeLabels = result['data']['vulnerabilities']['edges'][0]['node']['objectLabel'];
                for (const label of nodeLabels) {
                    observable['labels'].push(label['node']['value']);
                }
                observable['associations'] = [];
                let nodeReports = result['data']['vulnerabilities']['edges'][0]['node']['reports']['edges'];
                observable = processReportsRelations(observable, nodeReports, storage);
                let nodeSTIXRelations = result['data']['vulnerabilities']['edges'][0]['node']['stixCoreRelationships']['edges'];
                observable = processSTIXRelations(observable, nodeSTIXRelations, storage);
            }
        }
        else {
            let result = await searchIndicator(observable, storage);
            observable['state'] = "processed";
            observable['status'] = {};

            if (result['data']['indicators']['edges'].length === 0) {
                observable['status'] = { value: "Not Found", code: "not_found"};
            } else {
                let indic_score = result['data']['indicators']['edges'][0]['node']['x_opencti_score'];
                let indic_id = result['data']['indicators']['edges'][0]['node']['id'];
                observable['status']['value'] = indic_score + "/100";
                observable['link'] = storage['opencti_url'] + entityToPath('indicator') + '/' + indic_id;
                if (indic_score === 0) {
                    observable['status']['code'] = "benign";
                } else if (indic_score > 0 && indic_score < 60) {
                    observable['status']['code'] = "suspicious";
                } else {
                    observable['status']['code'] = "malicious";
                }
                observable['labels'] = [];
                let nodeLabels = result['data']['indicators']['edges'][0]['node']['objectLabel'];
                for (const label of nodeLabels) {
                    observable['labels'].push(label['value']);
                }
                observable['associations'] = [];
                let nodeReports = result['data']['indicators']['edges'][0]['node']['reports']['edges'];
                observable = processReportsRelations(observable, nodeReports, storage);
                let nodeSTIXRelations = result['data']['indicators']['edges'][0]['node']['stixCoreRelationships']['edges'];
                observable = processSTIXRelations(observable, nodeSTIXRelations, storage);
            }
        }
        updateObservableState(observable);
    }

    function renderObservableAssociationTable(observable: any) {
        const relations = observable.associations;
        if (relations.length > 0) {
            return (
                <TableContainer>
                    <Table>
                        <TableBody>
                            {relations.map((row: any) => (
                                <TableRow
                                    key={row.id}
                                    sx={{'&:last-child td, &:last-child th': {border: 0}}}
                                >
                                    <TableCell sx={{width: "10%"}} component="th" scope="row">
                                        <Chip sx={{borderRadius: 0}} label={row?.entity_type?.toUpperCase()}
                                              className={`bg-${row?.entity_type?.toLowerCase()}`}/>
                                    </TableCell>
                                    <TableCell><a href={row.link} target="_blank"> {row.name}</a></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )
        }
        else {
            return (
                <Typography sx={{p: 1}} variant="body2">No relations found</Typography>
            )
        }
    }

    function renderAccordion(observable: any) {
        if (observable.state === 'pending') {
            return (
                <Accordion square={true} sx={{border: "1px solid #f2f6fa", boxShadow: 0}} disabled>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon/>}
                    >
                        <Stack direction="row" sx={{display: 'flex', width: '100%'}} spacing={2}>
                            <CircularProgress size={25}/>
                            <Typography variant="body2">{observable.value}</Typography>
                        </Stack>
                    </AccordionSummary>
                </Accordion>
            )
        } else if (observable.state === 'processed' && observable.status['code'] === "not_found") {
            return (
                <Accordion square={true} sx={{border: "1px solid #f2f6fa", boxShadow: 0}}>
                    <AccordionSummary>
                        <Stack direction="row" sx={{display: 'flex', width: '100%'}} spacing={2}>
                            <Chip sx={{borderRadius: 0}} label={observable.status.value}
                                  className={`status-badge ${observable.status.code}`} variant="filled"/>
                            <Typography sx={{pt: 0.5}} variant="body2">{observable.value}</Typography>
                        </Stack>
                    </AccordionSummary>
                </Accordion>
            )
        } else {
            return (
                <Accordion square={true} sx={{border: "1px solid #f2f6fa", boxShadow: 0}}>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon/>}>
                        <Stack direction="row" sx={{display: 'flex', width: '100%'}} spacing={2}>
                            <Chip sx={{borderRadius: 0}} label={observable.status.value}
                                  className={`status-badge ${observable.status.code}`} variant="filled"/>
                            <Typography sx={{pt: 0.5}} variant="body2">{observable.value}</Typography>
                        </Stack>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Stack direction="row" useFlexGap flexWrap="wrap" spacing={1} sx={{pb: 2}}>
                            {observable.labels && observable.labels.map((value: string) => {
                                return (
                                    <Chip sx={{bgColor: "#6c757d"}} size="small" label={value} color="primary"
                                          variant="outlined"/>
                                )
                            })}
                        </Stack>
                        <Divider textAlign="left">KNOWLEDGE</Divider>
                        {renderObservableAssociationTable(observable)}
                        <Divider textAlign="left"></Divider>
                        <Box sx={{ pt: 2 , textAlign: 'right'}}>
                            <Button target="_blank" href={observable.link} sx={{color: "rgb(216, 27, 96)"}} size="small" startIcon={<OpenInNewRoundedIcon />}>
                                View in OpenCTI
                            </Button>
                        </Box>
                    </AccordionDetails>
                </Accordion>
            )
        }
    }

    if (notConfigured){
        return <Alert severity="warning">To get started, please configure the extension by setting the OpenCTI instance URL and token to use</Alert>
    }

    else if (noObservablesFound){
        return <Alert severity="info">No observables found on page</Alert>
    }

    else {
        return (
            <div>
                {observables && observables.map((observable) => {
                    return (
                        <div>
                            {renderAccordion(observable)}
                        </div>
                    );
                })}
            </div>
        )
    }
}

export default HomeView;
