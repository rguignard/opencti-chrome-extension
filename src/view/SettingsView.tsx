import * as React from 'react';
import Box from '@mui/material/Box';
import {Alert, Button, LinearProgress, Stack, TextField} from '@mui/material';
import {Field, Form, Formik} from 'formik';
import {healthCheck} from "../QueryHelpers";
import {useRef} from "react";


function SettingsView(props: any) {

    const [validConnection, setValidConnection] = React.useState(0);

    const [initialValues, setInitialValues] = React.useState({
        url: '',
        token: '',
    })

    React.useEffect(() => {
        chrome.storage.local.get(["opencti_url", "opencti_token"], function (result) {
            setInitialValues({
                url: (result.opencti_url === undefined) ? "" : result.opencti_url,
                token: (result.opencti_token === undefined) ? "" : result.opencti_token
            })
        });
    }, []);

    return (

        <Stack sx={{ width: '100%' }} spacing={2}>
            {(function() {
                switch (validConnection) {
                    case 1:
                        return <Alert severity="success">Connection succeeded</Alert>
                    case 2:
                        return <Alert severity="error">Failed to connect, please verify your settings</Alert>
                    default:
                        return null;
                }
            })()}

            <Formik
                enableReinitialize={true}
                initialValues={initialValues}
                onSubmit={(values, { setSubmitting }) => {
                    setValidConnection(0);
                    setSubmitting(false);
                    setTimeout(async () => {
                        try {
                            await healthCheck(values.url, values.token);
                            setValidConnection(1);
                            chrome.storage.local.set({"opencti_url": values.url}, function () {});
                            chrome.storage.local.set({"opencti_token": values.token}, function () {});
                        }
                        catch (err){
                            console.log(err);
                            setValidConnection(2);
                        }
                    }, 500);
                }}
            >
                {({
                      isSubmitting,
                  }) => (
                    <Form >
                        <Field
                            as={TextField}
                            fullWidth
                            sx={{ mt: 2 }}
                            id="url"
                            name="url"
                            variant="standard"
                            label="OpenCTI URL"
                            margin="dense"
                        />
                        <br />
                        <Field
                            as={TextField}
                            fullWidth
                            sx={{ mt: 2 }}
                            id="token"
                            name="token"
                            variant="standard"
                            label="OpenCTI Token"
                            margin="dense"
                        />
                        {isSubmitting && <LinearProgress />}
                        <br />
                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end'}}>
                            <Button
                                variant="contained"
                                color="primary"
                                size="medium"
                                type="submit"
                            >
                                Save
                            </Button>
                        </Box>
                    </Form>
                )}
            </Formik>
        </Stack>
    );
}
export default SettingsView;
