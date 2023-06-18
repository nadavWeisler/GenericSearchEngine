
import { Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
    headerContainer: {
        height: '80px',
        background: '#0b67ac',
        color: 'white',
        display: 'flex',
        alignItems: 'center'
    },
}))


export const Header = () => {
    const classes = useStyles();

    return (
        <div className={classes.headerContainer}>
            <Typography variant="h6" marginLeft='30px' fontSize='1.75rem'>Generic Search Engine</Typography>
        </div>
    )
}