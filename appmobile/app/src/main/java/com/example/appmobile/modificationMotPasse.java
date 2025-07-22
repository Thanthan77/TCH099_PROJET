package com.example.appmobile;

import android.content.Intent;
import android.os.AsyncTask;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import org.json.JSONObject;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;

public class modificationMotPasse extends AppCompatActivity implements View.OnClickListener {

    private EditText mdpbefore;
    private EditText mdpafter;
    private EditText mdpconfirm;
    private Button btnmdpchangement;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_modification_mdp);

        mdpbefore = findViewById(R.id.ancien_mdp);
        mdpafter = findViewById(R.id.nouveau_mdp);
        mdpconfirm = findViewById(R.id.confirmer_mdp);
        btnmdpchangement = findViewById(R.id.btn_appliquer_changement);

        btnmdpchangement.setOnClickListener(this);
    }

    @Override
    public void onClick(View view) {
        String ancien = mdpbefore.getText().toString().trim();
        String nouveau = mdpafter.getText().toString().trim();
        String confirm = mdpconfirm.getText().toString().trim();
        String courriel = getIntent().getStringExtra("courriel"); // supposé transmis depuis la page précédente

        if (ancien.isEmpty() || nouveau.isEmpty() || confirm.isEmpty()) {
            Toast.makeText(this, "Veuillez remplir tous les champs", Toast.LENGTH_SHORT).show();
        } else if (!nouveau.equals(confirm)) {
            Toast.makeText(this, "Les mots de passe ne correspondent pas", Toast.LENGTH_SHORT).show();
        } else {
            new ModificationMotDePasseTask().execute(ancien, nouveau, courriel);
        }
    }

    public class ModificationMotDePasseTask extends AsyncTask<String, Void, String> {
        @Override
        protected String doInBackground(String... params) {
            String ancienMdp = params[0];
            String nouveauMdp = params[1];
            String courriel = params[2];

            try {
                URL url = new URL("http://localhost/api/modifier_mdp_patient");
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("PUT");
                conn.setRequestProperty("Content-Type", "application/json; utf-8");
                conn.setRequestProperty("Accept", "application/json");
                conn.setDoOutput(true);

                JSONObject jsonParam = new JSONObject();
                jsonParam.put("COURRIEL", courriel);
                jsonParam.put("ANCIEN_MDP", ancienMdp);
                jsonParam.put("NOUVEAU_MDP", nouveauMdp);

                try (OutputStream os = conn.getOutputStream()) {
                    byte[] input = jsonParam.toString().getBytes("utf-8");
                    os.write(input, 0, input.length);
                }

                int code = conn.getResponseCode();
                InputStream is = (code == 200) ? conn.getInputStream() : conn.getErrorStream();

                BufferedReader reader = new BufferedReader(new InputStreamReader(is, "utf-8"));
                StringBuilder response = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) {
                    response.append(line.trim());
                }

                return response.toString();
            } catch (Exception e) {
                return "{\"error\": \"Erreur de requête\"}";
            }
        }

        @Override
        protected void onPostExecute(String result) {
            try {
                JSONObject response = new JSONObject(result);

                if (response.has("success")) {
                    Toast.makeText(modificationMotPasse.this, "Mot de passe modifié avec succès", Toast.LENGTH_SHORT).show();
                    finish();
                } else {
                    String erreur = response.optString("error", "Erreur de modification");
                    Toast.makeText(modificationMotPasse.this, erreur, Toast.LENGTH_SHORT).show();
                }
            } catch (Exception e) {
                Toast.makeText(modificationMotPasse.this, "Erreur serveur", Toast.LENGTH_SHORT).show();
            }
        }
    }
}
