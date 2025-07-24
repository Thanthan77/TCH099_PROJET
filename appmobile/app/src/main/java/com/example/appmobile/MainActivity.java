package com.example.appmobile;

import android.content.Intent;
import android.os.AsyncTask;
import android.os.Bundle;
import android.view.View;
import android.widget.*;

import androidx.appcompat.app.AppCompatActivity ;

import org.json.JSONObject;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;

public class MainActivity extends AppCompatActivity  {

    private TextView titre;
    private EditText connexion_email, connexion_mdp;
    private Button btn_se_connecter;
    private TextView lienInscription, lienMotDePasse;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        titre = findViewById(R.id.connexion);
        connexion_email = findViewById(R.id.connexion_email);
        connexion_mdp = findViewById(R.id.connexion_mdp);
        btn_se_connecter = findViewById(R.id.btn_se_connecter);
        lienInscription = findViewById(R.id.lien_inscription);
        lienMotDePasse = findViewById(R.id.lien_modifier_mdp);


        View.OnClickListener listener = view -> {
            int id = view.getId();
            if (id == R.id.lien_inscription) {
                startActivity(new Intent(MainActivity.this, PageInscription.class));
            } else if (id == R.id.lien_modifier_mdp) {
                startActivity(new Intent(MainActivity.this, modificationMotPasse.class));
            }
        };

        lienInscription.setOnClickListener(listener);
        lienMotDePasse.setOnClickListener(listener);


        btn_se_connecter.setOnClickListener(v -> {
            String courriel = connexion_email.getText().toString().trim();
            String mdp = connexion_mdp.getText().toString().trim();

            if (courriel.isEmpty() || mdp.isEmpty()) {
                Toast.makeText(this, "Veuillez remplir tous les champs", Toast.LENGTH_SHORT).show();
            } else {
                new ConnexionTask().execute(courriel, mdp);

            }
        });
    }


    public class ConnexionTask extends AsyncTask<String, Void, String> {

        @Override
        protected String doInBackground(String... params) {
            String courriel = params[0];
            String motDePasse = params[1];

            try {
                URL url = new URL("http://10.0.2.2/api/login_patient");
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("POST");
                conn.setRequestProperty("Content-Type", "application/json; utf-8");
                conn.setRequestProperty("Accept", "application/json");
                conn.setDoOutput(true);

                JSONObject jsonParam = new JSONObject();
                jsonParam.put("COURRIEL", courriel);
                jsonParam.put("MOT_DE_PASSE", motDePasse);

                try (OutputStream os = conn.getOutputStream()) {
                    byte[] input = jsonParam.toString().getBytes("utf-8");
                    os.write(input, 0, input.length);
                }

                InputStream is = (conn.getResponseCode() == 200)
                        ? conn.getInputStream()
                        : conn.getErrorStream();

                BufferedReader br = new BufferedReader(new InputStreamReader(is, "utf-8"));
                StringBuilder response = new StringBuilder();
                String line;
                while ((line = br.readLine()) != null) {
                    response.append(line);
                }
                br.close();

                return response.toString();

            } catch (Exception e) {
                e.printStackTrace();
                return "{\"error\": \"Erreur de connexion au serveur\"}";
            }
        }

        @Override
        protected void onPostExecute(String result) {
            try {
                JSONObject response = new JSONObject(result);

                if (response.has("token")) {
                    String token = response.getString("token");
                    String courriel = response.getString("COURRIEL");

                    Toast.makeText(MainActivity.this, "Connexion réussie", Toast.LENGTH_SHORT).show();

                    Intent intent = new Intent(MainActivity.this, PageMesRDV.class);
                    intent.putExtra("token", token);
                    intent.putExtra("courriel", courriel);
                    startActivity(intent);
                    finish();
                } else {
                    String erreur = response.optString("error", "Identifiants incorrects");
                    Toast.makeText(MainActivity.this, erreur, Toast.LENGTH_SHORT).show();
                }

            } catch (Exception e) {
                e.printStackTrace();
                Toast.makeText(MainActivity.this, "Erreur de traitement de la réponse du serveur", Toast.LENGTH_SHORT).show();
            }
        }
    }
}
