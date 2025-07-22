package com.example.appmobile;

import android.annotation.SuppressLint;
import android.content.ContentValues;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import com.example.appmobile.basesedonnes.DbUtil;
import com.example.appmobile.basesedonnes.clientContact;

public class PageInscription extends AppCompatActivity implements View.OnClickListener {

    private TextView messageInfo;
    private EditText nom;
    private EditText prenom;
    private EditText courriel;
    private EditText telephone;
    private EditText assurancemaladie;
    private EditText naissance;
    private EditText motPasse;
    private EditText confirmationPasse;

    private EditText adresse ;
    private Button soumis;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_inscription);

        messageInfo = findViewById(R.id.inscription);
        nom = findViewById(R.id.inscription_nom);
        prenom = findViewById(R.id.inscription_prenom);
        courriel = findViewById(R.id.inscription_email);
        telephone = findViewById(R.id.inscription_tel);
        assurancemaladie = findViewById(R.id.inscription_nam);
        naissance = findViewById(R.id.inscription_naissance);
        motPasse = findViewById(R.id.inscription_mdp);
        confirmationPasse = findViewById(R.id.inscription_mdp_confirmation);
        soumis = findViewById(R.id.btn_creer_compte);
        adresse = findViewById(R.id.inscription_adresse_autocomplete) ;
        soumis.setOnClickListener(this);

        afficherDernierPatient(); // ← Affiche les infos enregistrées automatiquement
    }

    @Override
    public void onClick(View v) {
        if (v.getId() == R.id.btn_creer_compte) {

            String nomPatient = nom.getText().toString();
            String prenomPatient = prenom.getText().toString();
            String courrielPatient = courriel.getText().toString();
            String telephonePatient = telephone.getText().toString();
            String assurancePatient = assurancemaladie.getText().toString();
            String naissancePatient = naissance.getText().toString();
            String motPassePatient = motPasse.getText().toString();
            String confPassePatient = confirmationPasse.getText().toString();
            String adressePatient = adresse.getText().toString() ;


            if (!motPassePatient.equals(confPassePatient)) {
                Toast.makeText(this, "Les mots de passe ne correspondent pas", Toast.LENGTH_SHORT).show();
                return;
            }

            int tel = telephonePatient.isEmpty() ? 0 : Integer.parseInt(telephonePatient);

            DbUtil dbUtil = new DbUtil(this);
            SQLiteDatabase db = dbUtil.getWritableDatabase();

            ContentValues valeurs = new ContentValues();
            valeurs.put(clientContact.PatientContract.Colonnes.NOM, nomPatient);
            valeurs.put(clientContact.PatientContract.Colonnes.PRENOM, prenomPatient);
            valeurs.put(clientContact.PatientContract.Colonnes.COURRIEL, courrielPatient);
            valeurs.put(clientContact.PatientContract.Colonnes.NUM_TEL, tel);
            valeurs.put(clientContact.PatientContract.Colonnes.NO_ASSURANCE, assurancePatient);
            valeurs.put(clientContact.PatientContract.Colonnes.DATE_NAISSANCE, naissancePatient);
            valeurs.put(clientContact.PatientContract.Colonnes.MOT_DE_PASSE, motPassePatient);


            long resultat = db.insert(clientContact.PatientContract.TABLE_NAME, null, valeurs);

            if (resultat != -1) {
                Toast.makeText(this, "Patient enregistré avec succès", Toast.LENGTH_SHORT).show();
                afficherDernierPatient(); // ← Met à jour les champs après insertion
            } else {
                Toast.makeText(this, "Erreur lors de l'enregistrement", Toast.LENGTH_SHORT).show();
            }

            db.close();
        }
    }

    private void afficherDernierPatient() {
        DbUtil dbUtil = new DbUtil(this);
        SQLiteDatabase db = dbUtil.getReadableDatabase();

        Cursor curseur = db.query(
                clientContact.PatientContract.TABLE_NAME,
                null,
                null, null, null, null,
                clientContact.PatientContract.Colonnes.DATE_NAISSANCE + " DESC",
                "1"
        );

        if (curseur.moveToFirst()) {
            @SuppressLint("Range") String nomPatient = curseur.getString(curseur.getColumnIndex(clientContact.PatientContract.Colonnes.NOM));
            @SuppressLint("Range") String prenomPatient = curseur.getString(curseur.getColumnIndex(clientContact.PatientContract.Colonnes.PRENOM));
            @SuppressLint("Range") String courrielPatient = curseur.getString(curseur.getColumnIndex(clientContact.PatientContract.Colonnes.COURRIEL));
            @SuppressLint("Range") String telPatient = curseur.getString(curseur.getColumnIndex(clientContact.PatientContract.Colonnes.NUM_TEL));
            @SuppressLint("Range") String assurancePatient = curseur.getString(curseur.getColumnIndex(clientContact.PatientContract.Colonnes.NO_ASSURANCE));
            @SuppressLint("Range") String naissancePatient = curseur.getString(curseur.getColumnIndex(clientContact.PatientContract.Colonnes.DATE_NAISSANCE));

            nom.setText(nomPatient);
            prenom.setText(prenomPatient);
            courriel.setText(courrielPatient);
            telephone.setText(telPatient);
            assurancemaladie.setText(assurancePatient);
            naissance.setText(naissancePatient);

        }

        curseur.close();
        db.close();
    }
}
