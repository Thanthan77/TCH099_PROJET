package com.example.appmobile;

import android.content.Intent;
import android.os.Bundle;
import android.widget.*;

import androidx.appcompat.app.AppCompatActivity;

import com.example.appmobile.ApiClient;
import com.example.appmobile.ApiService;
import com.example.appmobile.PageProfil;
import com.example.appmobile.R;
import com.example.appmobile.Patient;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ModificationInfo extends AppCompatActivity {

    private EditText prenom, nom, naissance, nam;
    private EditText email, emailConfirme, tel, civique, rue, ville, postal;
    private TextView retour ;
    private Button  btnAppliquer;
    private String courrielPatient, token;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_modification_profil);

        prenom = findViewById(R.id.profil_prenom);
        nom = findViewById(R.id.profil_nom);
        naissance = findViewById(R.id.profil_naissance);
        nam = findViewById(R.id.profil_nam);

        email = findViewById(R.id.profil_email);
        emailConfirme = findViewById(R.id.profil_email_confirme);
        tel = findViewById(R.id.profil_tel);
        civique = findViewById(R.id.profil_civique);
        rue = findViewById(R.id.profil_rue);
        ville = findViewById(R.id.profil_ville);
        postal = findViewById(R.id.profil_postal);

        retour = findViewById(R.id.btn_retour_profil);
        btnAppliquer = findViewById(R.id.btn_appliquer_changements);

        courrielPatient = getIntent().getStringExtra("courriel");
        token = getIntent().getStringExtra("token");

        disableUneditableFields();
        chargerInfosPatient(courrielPatient);

        retour.setOnClickListener(v -> {
            Intent intent = new Intent(ModificationInfo.this, PageProfil.class);
            intent.putExtra("courriel", courrielPatient);
            intent.putExtra("token", token);
            startActivity(intent);
            finish();
        });

        btnAppliquer.setOnClickListener(v -> {
            if (!champsModifiablesNonVides()) return;

            if (!email.getText().toString().equals(emailConfirme.getText().toString())) {
                Toast.makeText(this, "Les courriels ne correspondent pas", Toast.LENGTH_SHORT).show();
                return;
            }

            // Construire les données à envoyer
            Map<String, String> data = new HashMap<>();
            data.put("COURRIEL", email.getText().toString());
            data.put("PRENOM_PATIENT", prenom.getText().toString());
            data.put("NOM_PATIENT", nom.getText().toString());
            data.put("DATE_NAISSANCE", naissance.getText().toString());
            data.put("NO_ASSURANCE_MALADIE", nam.getText().toString());
            data.put("NUM_CIVIQUE", civique.getText().toString());
            data.put("RUE", rue.getText().toString());
            data.put("VILLE", ville.getText().toString());
            data.put("CODE_POSTAL", postal.getText().toString());
            data.put("NUM_TEL", tel.getText().toString());


            ApiService apiService = ApiClient.getApiService();
            Call<Void> call = apiService.updatePatient(data);

            call.enqueue(new Callback<Void>() {
                @Override
                public void onResponse(Call<Void> call, Response<Void> response) {
                    if (response.isSuccessful()) {
                        Toast.makeText(ModificationInfo.this, "Changements appliqués", Toast.LENGTH_SHORT).show();
                        // Retour vers PageProfil avec les nouvelles infos
                        Intent intent = new Intent(ModificationInfo.this, PageProfil.class);
                        intent.putExtra("courriel", email.getText().toString());
                        intent.putExtra("token", token);
                        startActivity(intent);
                        finish();
                    } else {
                        Toast.makeText(ModificationInfo.this, "Erreur lors de la mise à jour", Toast.LENGTH_SHORT).show();
                    }
                }

                @Override
                public void onFailure(Call<Void> call, Throwable t) {
                    Toast.makeText(ModificationInfo.this, "Erreur réseau : " + t.getMessage(), Toast.LENGTH_SHORT).show();
                }
            });
        });
    }

    private void disableUneditableFields() {
        prenom.setEnabled(false);
        nom.setEnabled(false);
        naissance.setEnabled(false);
        nam.setEnabled(false);
    }

    private boolean champsModifiablesNonVides() {
        if (email.getText().toString().trim().isEmpty() ||
                emailConfirme.getText().toString().trim().isEmpty() ||
                tel.getText().toString().trim().isEmpty() ||
                civique.getText().toString().trim().isEmpty() ||
                rue.getText().toString().trim().isEmpty() ||
                ville.getText().toString().trim().isEmpty() ||
                postal.getText().toString().trim().isEmpty()) {

            Toast.makeText(this, "Veuillez remplir tous les champs", Toast.LENGTH_SHORT).show();
            return false;
        }

        return true;
    }

    private void chargerInfosPatient(String courriel) {
        ApiService apiService = ApiClient.getApiService();
        Call<Patient> call = apiService.getPatient(courriel);

        call.enqueue(new Callback<Patient>() {
            @Override
            public void onResponse(Call<Patient> call, Response<Patient> response) {
                if (response.isSuccessful() && response.body() != null) {
                    Patient p = response.body();
                    prenom.setText(p.getPrenom());
                    nom.setText(p.getNom());
                    naissance.setText(p.getDateNaissance());
                    nam.setText(p.getNoAssurance());
                    email.setText(p.getCourriel());
                    emailConfirme.setText(p.getCourriel());
                    tel.setText(p.getNoTel());
                    civique.setText(String.valueOf(p.getNumCivique()));
                    rue.setText(p.getRue());
                    ville.setText(p.getVille());
                    postal.setText(p.getCodePostal());
                } else {
                    Toast.makeText(ModificationInfo.this, "Impossible de charger les infos", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<Patient> call, Throwable t) {
                Toast.makeText(ModificationInfo.this, "Erreur : " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }
}
