import {
  Button,
  Grid,
  lighten,
  makeStyles,
  FormControlLabel,
  Checkbox,
  TextField,
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CONFIGURATION_UPDATE } from "../../constants/actionTypes";
import { GREEN, WHITE } from "../../constants/colors";

const useStyles = makeStyles((theme) => ({
  root: {},
  step: {
    fontSize: 18,
    fontWeight: "bold",
    margin: "0",
  },
  save: {
    backgroundColor: GREEN,
    color: WHITE,
    marginTop: 30,
    fontSize: 18,
    "&:hover,&:active,&:focus": {
      backgroundColor: lighten(GREEN, 0.3),
    },
  },
}));

export default function Config() {
  const classes = useStyles();

  const dispatch = useDispatch();
  const config = useSelector((state) => state.configuration);

  const [oauth, setOauth] = useState(config.oauth);
  const [channel, setChannel] = useState(config.channel);
  const [token, setToken] = useState(config.token);
  const [loyalty, setLoyalty] = useState(config.loyalty);
  const [channelId, setChannelId] = useState(config.channelId);
  const [enableAnnounce, setEnableAnnounce] = useState(config.enableAnnounce);
  const [success, setSuccess] = useState(false);

  const validOauth = !!oauth && !oauth.startsWith("oauth:");
  const validToken = !!token && !token.startsWith("ey");

  useEffect(() => {
    if (token) {
      fetchMe(token);
    }
  }, [token]);

  useEffect(() => {
    if (channelId && token) {
      fetchLoyalty(channelId, token);
    }
  }, [channelId, token]);

  const fetchMe = (token) => {
    fetch("https://api.streamelements.com/kappa/v2/channels/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((resp) => resp.json())
      .then((me) => {
        setChannelId(me._id);
      });
  };

  const fetchLoyalty = (channelId, token) => {
    fetch(`https://api.streamelements.com/kappa/v2/loyalty/${channelId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((resp) => resp.json())
      .then((channel) => {
        setLoyalty(channel.loyalty.name);
      });
  };

  const onSave = (e) => {
    e.preventDefault();

    setSuccess(false);
    dispatch({
      type: CONFIGURATION_UPDATE,
      configuration: {
        oauth,
        channel,
        token,
        loyalty,
        channelId,
        enableAnnounce,
      },
    });

    setTimeout(() => {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }, 500);
  };

  return (
    <form className={classes.root} onSubmit={onSave}>
      {success && (
        <Alert severity="success" style={{ marginTop: 20 }}>
          Configurações salvas com sucesso.
        </Alert>
      )}

      <Grid container spacing={1} alignItems="center">
        <h2>Configuração do Chat</h2>
        <Grid item xs={12}>
          <p className={classes.step}>
            1. Acesse{" "}
            <a
              href="https://twitchapps.com/tmi/"
              rel="noreferrer"
              target="_blank"
            >
              https://twitchapps.com/tmi/
            </a>
          </p>
        </Grid>

        <Grid item xs={12}>
          <p className={classes.step}>2. Clique em "Connect"</p>
        </Grid>

        <Grid item xs={12} style={{ marginBottom: 20 }}>
          <p className={classes.step}>
            3. Copie o código gerado e cole no campo "Código" abaixo, deve
            começar com oauth:...
          </p>
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            value={oauth}
            variant="outlined"
            label="Código"
            onChange={({ target: { value } }) => setOauth(value)}
            type="password"
            placeholder="oauth:abcdefghi123456789"
            fullWidth
            required
            name="oauth"
            error={validOauth}
            helperText={validOauth ? "Código inválido" : ""}
          />
        </Grid>

        <Grid item xs={12} sm={8}>
          <TextField
            value={channel}
            variant="outlined"
            label="Nome do Canal"
            placeholder="unManiac"
            name="channel"
            required
            onChange={({ target: { value } }) => setChannel(value)}
            fullWidth
          />
        </Grid>

        <h2>Configuração do StreamElements</h2>
        <Grid item xs={12}>
          <p className={classes.step}>
            1. Acesse{" "}
            <a
              href="https://streamelements.com/dashboard/account/channels"
              rel="noreferrer"
              target="_blank"
            >
              https://streamelements.com/dashboard/account/channels
            </a>
          </p>
        </Grid>

        <Grid item xs={12}>
          <p className={classes.step}>
            2. Clique em "Show secrets" no canto superior direito
          </p>
        </Grid>

        <Grid item xs={12} style={{ marginBottom: 20 }}>
          <p className={classes.step}>
            3. Terá exibido uma seção com um valor chamado "JWT Token", copie e
            cole no campo "Token" abaixo, deve começar com ey...
          </p>
        </Grid>

        <Grid item xs={12} sm={8}>
          <TextField
            value={token}
            variant="outlined"
            label="Token"
            name="token"
            placeholder="eyJhbGciOiJIUzI..."
            required
            type="password"
            onChange={({ target: { value } }) => {
              setChannelId(null);
              setToken(value);
            }}
            fullWidth
            error={validToken}
            helperText={validToken ? "Token inválido" : ""}
          />
        </Grid>

        <Grid item xs={9} sm={2}>
          <TextField
            value={loyalty}
            variant="outlined"
            label="Nome dos pontos"
            disabled
            name="loyalty"
            fullWidth
          />
        </Grid>

        <Grid item xs={9} sm={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              fetchLoyalty(channelId, token);
            }}
            fullWidth
          >
            Atualizar nome
          </Button>
        </Grid>

        <FormControlLabel
          control={
            <Checkbox
              checked={enableAnnounce}
              onChange={({ target: { checked } }) =>
                setEnableAnnounce(checked)
              }
              color="primary"
              name="enableAnnounce"
            />
          }
          label="Habilitar /announce nas mensagens (pode não funcionar no app mobile)"
        />

        <Grid item xs={12}>
          <Button variant="contained" type="submit" className={classes.save}>
            Salvar
          </Button>
        </Grid>
      </Grid>
    </form>
  );
}
