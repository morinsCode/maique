import { useState } from "react";
import { useNavigate } from "react-router";
import { Box, Button, Stack, TextField, Typography } from "@mui/material";

function generateRoomId() {
  return Math.random().toString(36).slice(2, 8);
}

function LandingPage() {
  const navigate = useNavigate();

  const [joinCode, setJoinCode] = useState("");
  const [isJoinFormOpen, setIsJoinFormOpen] = useState(false);

  function startAsDj() {
    navigate(`/dj/${generateRoomId()}`);
  }

  function joinAsGuest() {
    const roomId = joinCode.trim();

    if (roomId) {
      navigate(`/guest/${roomId}`);
    }
  }

  return (
    <Box
      component="main"
      sx={{
        minHeight: "100dvh",
        bgcolor: "#e8e7e2",
        color: "#111",
        border: "1px solid #111",
      }}
    >
      <Box
        component="header"
        sx={{
          minHeight: 80,
          px: { xs: 3, md: 6 },
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #111",
        }}
      >
        <Typography
          component="span"
          sx={{
            fontFamily: '"Roboto Condensed", "Arial Narrow", sans-serif',
            fontWeight: 900,
            fontSize: { xs: "2rem", md: "3rem" },
            lineHeight: 1,
            letterSpacing: "-0.08em",
            textTransform: "uppercase",
          }}
        >
          MaiQue
        </Typography>

        <Typography
          component="a"
          href="#how-it-works"
          sx={{
            color: "inherit",
            fontFamily: "monospace",
            textDecoration: "none",
            fontSize: { xs: "0.75rem", md: "0.9rem" },
            textTransform: "uppercase",
          }}
        >
          How it works →
        </Typography>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" },
          minHeight: { md: "calc(100dvh - 80px)" },
        }}
      >
        <Box
          sx={{
            p: { xs: 3, sm: 5, md: 6 },
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            borderRight: { md: "1px solid #111" },
          }}
        >
          <Typography
            component="h1"
            sx={{
              m: 0,
              maxWidth: 900,
              fontFamily: '"Roboto Condensed", "Arial Narrow", sans-serif',
              fontSize: "clamp(3.6rem, 8vw, 8.5rem)",
              fontWeight: 900,
              lineHeight: 0.86,
              letterSpacing: "-0.07em",
              textTransform: "uppercase",
            }}
          >
            Que Music
            <br />
          </Typography>

          <Typography
            sx={{
              mt: 4,
              fontFamily: "monospace",
              fontSize: { xs: "1rem", md: "1.25rem" },
            }}
          >
            Add requests DJ approves Everyone hears it
          </Typography>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{ mt: 5, maxWidth: 720 }}
          >
            <Button
              variant="contained"
              onClick={startAsDj}
              sx={{
                flex: 1,
                bgcolor: "#111",
                color: "#f4f4f0",
                borderRadius: 0,
                py: 2,
                fontFamily: '"Roboto Condensed", sans-serif',
                fontSize: "1.25rem",
                fontWeight: 800,
                "&:hover": {
                  bgcolor: "#303030",
                },
              }}
            >
              Create a room →
            </Button>

            <Button
              variant="outlined"
              onClick={() => setIsJoinFormOpen(true)}
              sx={{
                flex: 1,
                color: "#111",
                borderColor: "#111",
                borderWidth: 2,
                borderRadius: 0,
                py: 2,
                fontFamily: '"Roboto Condensed", sans-serif',
                fontSize: "1.25rem",
                fontWeight: 800,
                "&:hover": {
                  borderColor: "#111",
                  borderWidth: 2,
                  bgcolor: "rgba(0, 0, 0, 0.05)",
                },
              }}
            >
              Enter a room →
            </Button>
          </Stack>

          {isJoinFormOpen && (
            <Box
              component="form"
              onSubmit={(event) => {
                event.preventDefault();
                joinAsGuest();
              }}
              sx={{
                mt: 2,
                maxWidth: 720,
                p: 2,
                border: "1px solid #111",
              }}
            >
              <Typography
                sx={{
                  mb: 1.5,
                  fontFamily: "monospace",
                  fontSize: "0.85rem",
                  textTransform: "uppercase",
                }}
              >
                Enter your room code
              </Typography>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  fullWidth
                  label="Room code"
                  value={joinCode}
                  onChange={(event) => setJoinCode(event.target.value)}
                  slotProps={{
                    input: {
                      sx: {
                        borderRadius: 0,
                        fontFamily: "monospace",
                      },
                    },
                  }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  disabled={!joinCode.trim()}
                  sx={{ borderRadius: 0, whiteSpace: "nowrap" }}
                >
                  Join room
                </Button>
              </Stack>
            </Box>
          )}
        </Box>

        <Box
          aria-label="DJ booth in a club"
          sx={{
            minHeight: { xs: 360, md: "auto" },
            borderTop: { xs: "1px solid #111", md: "none" },

            backgroundImage: `
              linear-gradient(
                135deg,
                rgba(20, 0, 110, 0.38),
                rgba(0, 80, 255, 0.28)
              ),
              url("/images/club-dj.png")
            `,
            backgroundColor: "#090d24",
            backgroundSize: "cover",
            backgroundPosition: "right",
          }}
        />
      </Box>
    </Box>
  );
}

export default LandingPage;
