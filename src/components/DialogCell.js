import { Dialog, DialogContent, DialogContentText, IconButton } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';

export const DialogCell = (props) => (
    <Dialog open={props.open}>
        <DialogContent style={{ height: 300, width: 500 }}>
            <IconButton aria-label="close" onClick={props.handleClose} sx={{ position: 'absolute', right: 8, top: 8, color: (theme) => theme.palette.grey[500] }}>
                <CloseIcon />
            </IconButton>
            <DialogContentText>
                {props.data}
            </DialogContentText>
        </DialogContent>
    </Dialog>
)