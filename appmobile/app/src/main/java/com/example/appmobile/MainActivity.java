package com.example.appmobile;


import static androidx.core.content.ContextCompat.startActivity;

import android.content.Intent;
import android.os.AsyncTask;
import android.os.Bundle;
import android.view.View;
import android.widget.*;
import androidx.appcompat.app.AppCompatActivity;


import org.json.JSONObject;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;

public class MainActivity extends AppCompatActivity implements View.OnClickListener {

    private TextView titre;
    private EditText connexion_email, connexion_mdp;
    private Button btn_se_connecter;
    private TextView messageErreur;
    private TextView lienInscription ;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        titre=(TextView)findViewById(R.id.connexion);
        connexion_email = findViewById(R.id.connexion_email);
        connexion_mdp = findViewById(R.id.connexion_mdp);
        btn_se_connecter = findViewById(R.id.btn_se_connecter);
        lienInscription= findViewById<TextView>(R.id.lien_inscription);
        messageErreur = new TextView(this);

        lienInscription.setOnClickListener(this);
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



       lienInscription.setOnClickListener(new View.OnClickListener() {
        @Override
        void onClick(View view) {
            Intent intent = new Intent(MainActivity.this, PageInscription.class);
            startActivity(intent);

        }
    }}




    private class ConnexionTask extends AsyncTask<String, Void, String> {
        @Override
        protected String doInBackground(String... params) {
            String courriel = params[0];
            String motDePasse = params[1];

            try {
                URL url = new URL("http://localhost/api/login_patient");
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
                return "{\"error\": \"Erreur de connexion\"}";
            }
        }

        @Override
        protected void onPostExecute(String result) {
            try {
                JSONObject response = new JSONObject(result);

                if (response.has("token")) {
                    // Connexion réussie
                    String token = response.getString("token");
                    String courriel = response.getString("COURRIEL");

                    // Tu peux stocker le token si nécessaire
                    Toast.makeText(MainActivity.this, "Connexion réussie", Toast.LENGTH_SHORT).show();

                    // Redirige vers la prochaine activité
                    Intent intent = new Intent(MainActivity.this, com.example.appmobile.PageMesRDV.class);
                    intent.putExtra("token", token);
                    intent.putExtra("courriel", courriel);
                    startActivity(intent);
                    finish();
                } else {
                    // Erreur retournée par le serveur
                    String erreur = response.optString("error", "Identifiants incorrects");
                    Toast.makeText(MainActivity.this, erreur, Toast.LENGTH_SHORT).show();
                }
            } catch (Exception e) {
                Toast.makeText(MainActivity.this, "Erreur d'analyse du serveur", Toast.LENGTH_SHORT).show();
            }
        }
    }
}
