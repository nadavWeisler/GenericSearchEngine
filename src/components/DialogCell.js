import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

export const DialogCell = ({ open, data, handleClose }) => (
  <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
    <DialogTitle sx={{ pr: 6 }}>
      Cell value
      <IconButton
        aria-label="close"
        onClick={handleClose}
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <CloseIcon />
      </IconButton>
    </DialogTitle>
    <DialogContent dividers>
      <Typography
        component="pre"
        sx={{
          margin: 0,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          fontFamily: "inherit",
        }}
      >
        {data || "No value"}
      </Typography>
    </DialogContent>
  </Dialog>
);
