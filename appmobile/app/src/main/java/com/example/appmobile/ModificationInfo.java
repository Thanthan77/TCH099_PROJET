package com.example.appmobile;

import android.content.Intent;
import android.os.Bundle;
import android.widget.*;

import androidx.appcompat.app.AppCompatActivity;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

import java.util.HashMap;
import java.util.Map;

/**
 * Écran de modification du profil.
 * Le patient pourra modifier certaines de ses informations personnelles et pourra aussi
 * naviguer en arrière vers la page de profil. Une fois ses informations enregistrées,
 * il sera redirigé vers la page profil avec ses informations mises à jour.
 */
public class ModificationInfo extends AppCompatActivity {
    //Imposer les formats des informations du patients
    private static final String RX_CIVIQUE = "^\\d+$";
    private static final String RX_TEL10   = "^\\d{10}$";
    private static final String RX_VILLE   = "^[\\p{L} '-]+$";
    private static final String RX_POSTAL  = "^[A-Z]\\d[A-Z]\\d[A-Z]\\d$";

    //Références UI
    private EditText prenom, nom, naissance, nam;
    private EditText email, emailConfirme, tel, civique, rue, ville, postal;
    private TextView retour ;
    private Button  btnAppliquer;
    private String courrielPatient, token;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_modification_profil);

        //Récupération des Views
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

        //Données reçues pour la session
        courrielPatient = getIntent().getStringExtra("courriel");
        token = getIntent().getStringExtra("token");

        //Imposer les chiffres pour téléphone et num civique
        android.text.InputFilter digitsOnly = (src, s, e, dest, ds, de) ->
                src.toString().matches("\\d+") ? src : "";
        tel.setFilters(new android.text.InputFilter[]{digitsOnly});
        civique.setFilters(new android.text.InputFilter[]{digitsOnly});

        //Imposer lettres en majuscules
        postal.addTextChangedListener(new android.text.TextWatcher() {
            @Override public void beforeTextChanged(CharSequence s, int st, int c, int a) {}
            @Override public void onTextChanged(CharSequence s, int st, int b, int c) {
                String up = s.toString().replace(" ", "").toUpperCase();
                if (!up.equals(s.toString())) {
                    postal.setText(up);
                    postal.setSelection(up.length());
                }
            }
            @Override public void afterTextChanged(android.text.Editable s) {}
        });

        //Champs non modifiables pour prénom, nom, date de naissance et numéro d'assurance maladie
        disableUneditableFields();
        //Pré-chargement des informations patient
        chargerInfosPatient(courrielPatient);

        //Lien vers la page de profil sans changements
        retour.setOnClickListener(v -> {
            Intent intent = new Intent(ModificationInfo.this, PageProfil.class);
            intent.putExtra("courriel", courrielPatient);
            intent.putExtra("token", token);
            startActivity(intent);
            finish();
        });

        //Applique le changement d'informations
        btnAppliquer.setOnClickListener(v -> {
            if (!champsModifiablesNonVides()) return;

            //Message d'erreur si l'email n'est pas identique à l'email de confirmation
            if (!email.getText().toString().trim().equals(emailConfirme.getText().toString().trim())) {
                Toast.makeText(this, "Les courriels ne correspondent pas", Toast.LENGTH_SHORT).show();
                return;
            }
            if (!validateModifs()) return;

            //Construction du payload pour l’API
            Map<String, String> data = new HashMap<>();
            data.put("COURRIEL", email.getText().toString().trim().toLowerCase());
            data.put("PRENOM_PATIENT", prenom.getText().toString());
            data.put("NOM_PATIENT", nom.getText().toString());
            data.put("DATE_NAISSANCE", naissance.getText().toString());
            data.put("NO_ASSURANCE_MALADIE", nam.getText().toString());
            data.put("NUM_CIVIQUE", civique.getText().toString().trim());
            data.put("RUE", rue.getText().toString().trim());
            data.put("VILLE", ville.getText().toString().trim());
            data.put("CODE_POSTAL", postal.getText().toString().trim().toUpperCase());
            data.put("NUM_TEL", tel.getText().toString().trim());

            ApiService apiService = ApiClient.getApiService();
            Call<Void> call = apiService.updatePatient(data);

            //Requête asynchrone
            call.enqueue(new Callback<Void>() {
                @Override
                public void onResponse(Call<Void> call, Response<Void> response) {
                    if (response.isSuccessful()) {
                        Toast.makeText(ModificationInfo.this, "Changements appliqués", Toast.LENGTH_SHORT).show();
                        //Si l'email a été changé, l'email pour la session connectée va être changé aussi
                        Intent intent = new Intent(ModificationInfo.this, PageProfil.class);
                        intent.putExtra("courriel", email.getText().toString());
                        intent.putExtra("token", token);
                        startActivity(intent);
                        finish();
                    } else {
                        //Message d'erreur pour la modification
                        Toast.makeText(ModificationInfo.this, "Erreur lors de la mise à jour", Toast.LENGTH_SHORT).show();
                    }
                }

                @Override
                public void onFailure(Call<Void> call, Throwable t) {
                    //Message d'erreur réseau/transport
                    Toast.makeText(ModificationInfo.this, "Erreur réseau : " + t.getMessage(), Toast.LENGTH_SHORT).show();
                }
            });
        });
    }

    //Champs non modifiables
    private void disableUneditableFields() {
        prenom.setEnabled(false);
        nom.setEnabled(false);
        naissance.setEnabled(false);
        nam.setEnabled(false);
    }

    //Vérifie la présence des champs modifiables
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

    //Validation des formats des champs
    private boolean validateModifs() {
        String vEmail  = email.getText().toString().trim().toLowerCase();
        String vEmail2 = emailConfirme.getText().toString().trim().toLowerCase();
        String vTel    = tel.getText().toString().trim();
        String vCiv    = civique.getText().toString().trim();
        String vRue    = rue.getText().toString().trim();
        String vVille  = ville.getText().toString().trim();
        String vPost   = postal.getText().toString().trim().toUpperCase();

        if (vEmail.isEmpty() || !android.util.Patterns.EMAIL_ADDRESS.matcher(vEmail).matches()) {
            Toast.makeText(this, "Courriel invalide (ex: exemple@gmail.com)", Toast.LENGTH_SHORT).show();
            email.requestFocus(); return false;
        }
        if (!vEmail.equals(vEmail2)) {
            Toast.makeText(this, "Les courriels ne correspondent pas", Toast.LENGTH_SHORT).show();
            emailConfirme.requestFocus(); return false;
        }

        if (!vTel.matches(RX_TEL10)) {
            Toast.makeText(this, "Téléphone invalide : 10 chiffres", Toast.LENGTH_SHORT).show();
            tel.requestFocus(); return false;
        }

        if (!vCiv.matches(RX_CIVIQUE)) {
            Toast.makeText(this, "Numéro civique invalide : chiffres uniquement", Toast.LENGTH_SHORT).show();
            civique.requestFocus(); return false;
        }

        if (!vVille.matches(RX_VILLE)) {
            Toast.makeText(this, "Ville invalide : lettres, accents ou tirets seulement", Toast.LENGTH_SHORT).show();
            ville.requestFocus(); return false;
        }

        if (!vPost.matches(RX_POSTAL)) {
            Toast.makeText(this, "Code postal invalide : format A1A1A1", Toast.LENGTH_SHORT).show();
            postal.requestFocus(); return false;
        }

        email.setText(vEmail);
        emailConfirme.setText(vEmail2);
        postal.setText(vPost);

        return true;
    }

    //Récupère les informations du patient par courriel et remplit le formulaire
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
