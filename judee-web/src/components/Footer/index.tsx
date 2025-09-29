import { Container, Grid, Typography } from "@mui/material"

export const FooterSmall = () => {
  return (
    <Container maxWidth="xl">
    <Grid container sx={{
        justifyContent: "space-between",
        alignItems: "center",
        height: "40px",
        textAlign: { xs: "center" }
    }}>
        <Grid>
            <Typography variant="body2" sx={{fontSize: "12px"}}>
                © Copyright 2025 St. Jude Children's Research Hospital, a not-for-profit, section 501(c)(3).
            </Typography>
        </Grid>
        {/* <Grid>
            <Typography variant="body2" sx={{ textAlign: "right", fontSize: "12px" }}>
                Privacy • Disclaimer / Registrations / Copyright • Linking • Privacy (HIPAA) • Non-Discrimination
            </Typography>
        </Grid> */}
    </Grid>
</Container>
  )
}
