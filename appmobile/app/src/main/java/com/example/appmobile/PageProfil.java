package com.example.appmobile;

import android.content.Intent;
import android.os.Bundle;
import android.widget.*;

import androidx.appcompat.app.AppCompatActivity;

//import com.example.appmobile.ModificationInfo;
//import com.example.appmobile.ModificationMotDePasse;
import com.example.appmobile.PagesRDV.pagePriseService;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class PageProfil extends AppCompatActivity {

    private EditText prenom, nom, dateNaissance, noAssurance, courriel;
    private EditText numCivique, rue, ville, codePostal;
    private TextView lienAccueil, lienRDV, lienProfil, lienModif, lienDeconnexion;

    private String token, courrielPatient;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_profil);

        // Champs
        prenom = findViewById(R.id.profil_prenom);
        nom = findViewById(R.id.profil_nom);
        dateNaissance = findViewById(R.id.profil_naissance);
        noAssurance = findViewById(R.id.profil_nam);
        courriel = findViewById(R.id.profil_email);
        numCivique = findViewById(R.id.profil_civique);
        rue = findViewById(R.id.profil_rue);
        ville = findViewById(R.id.profil_ville);
        codePostal = findViewById(R.id.profil_postal);

        // Lien navigation
        lienAccueil = findViewById(R.id.lienMesRdv);
        lienRDV = findViewById(R.id.lien_rdv);
        lienProfil = findViewById(R.id.lien_modifier_infos);
        lienModif = findViewById(R.id.lien_modifier_mdp);
        lienDeconnexion = findViewById(R.id.lienDeconnexion);

        // Désactiver modification
        disableAllFields();

        // Récupérer token + courriel
        token = getIntent().getStringExtra("token");
        courrielPatient = getIntent().getStringExtra("courriel");

        // Charger les infos
        chargerProfil(courrielPatient);

        lienAccueil.setOnClickListener(v -> {
            Intent intent = new Intent(PageProfil.this, PageMesRDV.class);
            intent.putExtra("token", token);
            intent.putExtra("courriel", courrielPatient);
            startActivity(intent);
        });

        lienRDV.setOnClickListener(v -> {
            Intent intent = new Intent(PageProfil.this, pagePriseService.class);
            intent.putExtra("token", token);
            intent.putExtra("courriel", courrielPatient);
            startActivity(intent);
        });

        lienDeconnexion.setOnClickListener(v -> {
            Intent intent = new Intent(PageProfil.this, MainActivity.class);
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
            startActivity(intent);
            finish();
        });
        lienProfil.setOnClickListener(v -> {
            Intent intent = new Intent(PageProfil.this, PagesProfil.ModificationInfo.class);
            intent.putExtra("token", token);
            intent.putExtra("courriel", courrielPatient);
            startActivity(intent);
        });

        lienModif.setOnClickListener(v -> {
            Intent intent = new Intent(PageProfil.this, PagesProfil.ModificationMotDePasse.class);
            intent.putExtra("token", token);
            intent.putExtra("courriel", courrielPatient);
            startActivity(intent);
        });

    }

    private void disableAllFields() {
        prenom.setEnabled(false);
        nom.setEnabled(false);
        dateNaissance.setEnabled(false);
        noAssurance.setEnabled(false);
        courriel.setEnabled(false);
        numCivique.setEnabled(false);
        rue.setEnabled(false);
        ville.setEnabled(false);
        codePostal.setEnabled(false);
    }

    private void chargerProfil(String courriel) {
        ApiService apiService = ApiClient.getClient().create(ApiService.class);
        Call<java.util.List<Patient>> call = apiService.getPatient(courriel);

        call.enqueue(new Callback<java.util.List<Patient>>() {
            @Override
            public void onResponse(Call<java.util.List<Patient>> call, Response<java.util.List<Patient>> response) {
                if (response.isSuccessful() && !response.body().isEmpty()) {
                    Patient patient = response.body().get(0);

                    prenom.setText(patient.getPrenom());
                    nom.setText(patient.getNom());
                    dateNaissance.setText(patient.getDateNaissance());
                    noAssurance.setText(patient.getNoAssurance());
                    courriel.setText(patient.getCourriel());
                    numCivique.setText(String.valueOf(patient.getNumCivique()));
                    rue.setText(patient.getRue());
                    ville.setText(patient.getVille());
                    codePostal.setText(patient.getCodePostal());
                } else {
                    Toast.makeText(PageProfil.this, "Profil introuvable", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<java.util.List<Patient>> call, Throwable t) {
                Toast.makeText(PageProfil.this, "Erreur réseau : " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }
}
