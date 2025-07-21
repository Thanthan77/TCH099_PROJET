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

import basesedonnes.DbUtil;
import basesedonnes.clientContact;

public class pageinfogenerale extends AppCompatActivity implements View.OnClickListener {

    private TextView messageInfo;
    private EditText nom;
    private EditText prenom;
    private EditText courriel;
    private EditText telephone;
    private EditText assurancemaladie;
    private EditText naissance;
    private EditText motPasse;
    private EditText confirmationPasse;
    private Button soumis;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_inscription);

        messageInfo = findViewById(R.id.titreinscription);
        nom = findViewById(R.id.editTextNom);
        prenom = findViewById(R.id.editTextPrenom);
        courriel = findViewById(R.id.editTextTextEmailLogin);
        telephone = findViewById(R.id.editTextPhonelogin);
        assurancemaladie = findViewById(R.id.editTextcarteassurance);
        naissance = findViewById(R.id.editTextDatelogin);
        motPasse = findViewById(R.id.editTextTextPasswordlogin);
        confirmationPasse = findViewById(R.id.editTextTextconfirmationlogin);
        soumis = findViewById(R.id.buttoninfogene);
        soumis.setOnClickListener(this);

        afficherDernierPatient(); // ← Affiche les infos enregistrées automatiquement
    }

    @Override
    public void onClick(View v) {
        if (v.getId() == R.id.buttoninfogene) {

            String nomPatient = nom.getText().toString();
            String prenomPatient = prenom.getText().toString();
            String courrielPatient = courriel.getText().toString();
            String telephonePatient = telephone.getText().toString();
            String assurancePatient = assurancemaladie.getText().toString();
            String naissancePatient = naissance.getText().toString();
            String motPassePatient = motPasse.getText().toString();
            String confPassePatient = confirmationPasse.getText().toString();

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
