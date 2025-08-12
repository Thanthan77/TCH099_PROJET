package com.example.appmobile;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.widget.*;

import androidx.appcompat.app.AppCompatActivity;

import com.example.appmobile.PagesRDV.pagePriseService;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

/**
 * Écran du profil patient avec toutes ses informations.
 *Le patient consulter ses données et pourra naviguer vers les pages de modification de profil ou de mot de passe
 * et vers les pages de prise de rendez-vous, ses rendez-vous et de déconnexion(nav-bar).
 */
public class PageProfil extends AppCompatActivity {

    //Références UI
    private EditText prenom, nom, dateNaissance, noAssurance, email;
    private EditText numCivique, rue, ville, codePostal, tel;
    private TextView lienAccueil, lienRDV, lienProfil, lienModif, lienDeconnexion;

    //Données de session
    private String token, courrielPatient;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_profil);//Lie le layout activity_profil avec PageProfil.java

        //Récupère le courriel
        courrielPatient = getIntent().getStringExtra("courriel");

        //Récupère la session locale
        SharedPreferences prefs = getSharedPreferences("session", MODE_PRIVATE);
        if (prefs != null) {
            String savedToken = prefs.getString("token", null);
            String savedCourriel = prefs.getString("courriel", null);
            if (savedToken != null && savedCourriel != null) {
                token = savedToken;
                courrielPatient = savedCourriel;
            }
        }

        //Récupération des Views
        prenom = findViewById(R.id.profil_prenom);
        nom = findViewById(R.id.profil_nom);
        dateNaissance = findViewById(R.id.profil_naissance);
        noAssurance = findViewById(R.id.profil_nam);
        email = findViewById(R.id.profil_email);
        numCivique = findViewById(R.id.profil_civique);
        rue = findViewById(R.id.profil_rue);
        ville = findViewById(R.id.profil_ville);
        codePostal = findViewById(R.id.profil_postal);
        tel = findViewById(R.id.profil_tel);

        lienAccueil = findViewById(R.id.lienMesRdv);
        lienRDV = findViewById(R.id.lien_rdv);
        lienProfil = findViewById(R.id.lien_modifier_infos);
        lienModif = findViewById(R.id.lien_modifier_mdp);
        lienDeconnexion = findViewById(R.id.lienDeconnexion);

        //Tous les champs d'information du profil sont en lecture seule
        disableAllFields();

        //Affiche les infos
        chargerProfil(courrielPatient);


        //Lien vers la page des rdv du patient
        lienAccueil.setOnClickListener(v -> {
            Intent intent = new Intent(PageProfil.this, PageMesRDV.class);
            intent.putExtra("token", token);
            intent.putExtra("courriel", courrielPatient);
            startActivity(intent);
        });

        //Lien vers la prise de rdv
        lienRDV.setOnClickListener(v -> {
            Intent intent = new Intent(PageProfil.this, pagePriseService.class);
            intent.putExtra("token", token);
            intent.putExtra("courriel", courrielPatient);
            startActivity(intent);
        });

        //Lien de déconnexion vers la page de connexion
        lienDeconnexion.setOnClickListener(v -> {
            Intent intent = new Intent(PageProfil.this, MainActivity.class);
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
            startActivity(intent);
            finish();
        });

        //Lien vers la page de modification d'informations
        lienProfil.setOnClickListener(v -> {
            Intent intent = new Intent(PageProfil.this, ModificationInfo.class);
            intent.putExtra("token", token);
            intent.putExtra("courriel", courrielPatient);
            startActivity(intent);
        });

        //Lien vers la page de modification de mdp
        lienModif.setOnClickListener(v -> {
            Intent intent = new Intent(PageProfil.this, ModificationMotDePasse.class);
            intent.putExtra("token", token);
            intent.putExtra("courriel", courrielPatient);
            startActivity(intent);
        });
    }

    //Les champs d'informations sont en lecture seule
    private void disableAllFields() {
        prenom.setEnabled(false);
        nom.setEnabled(false);
        dateNaissance.setEnabled(false);
        noAssurance.setEnabled(false);
        email.setEnabled(false);
        numCivique.setEnabled(false);
        rue.setEnabled(false);
        ville.setEnabled(false);
        codePostal.setEnabled(false);
        tel.setEnabled(false);
    }

    /**
     * Appel API pour récupérer le profil du patient par son courriel
     */
    private void chargerProfil(String courriel) {
        ApiService apiService = ApiClient.getApiService() ;
        Call<Patient> call = apiService.getPatient(courrielPatient);

        call.enqueue(new Callback<Patient>() {
            @Override
            public void onResponse(Call<Patient> call, Response<Patient> response) {
                if (response.isSuccessful() && response.body() != null) {
                    Patient patient = response.body();

                    //Remplissage des champs
                    prenom.setText(patient.getPrenom());
                    nom.setText(patient.getNom());
                    dateNaissance.setText(patient.getDateNaissance());
                    noAssurance.setText(patient.getNoAssurance());
                    email.setText(patient.getCourriel());
                    numCivique.setText(String.valueOf(patient.getNumCivique()));
                    rue.setText(patient.getRue());
                    ville.setText(patient.getVille());
                    codePostal.setText(patient.getCodePostal());
                    tel.setText(patient.getNoTel());

                } else {
                    Toast.makeText(PageProfil.this, "Profil introuvable", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<Patient> call, Throwable t) {
                Toast.makeText(PageProfil.this, "Erreur réseau : " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });

    }
}
