package com.example.appmobile;

import com.google.gson.annotations.SerializedName;

public class Patient {
    @SerializedName("PRENOM_PATIENT") private String prenom;
    @SerializedName("NOM_PATIENT") private String nom;
    @SerializedName("DATE_NAISSANCE") private String dateNaissance;
    @SerializedName("NO_ASSURANCE_MALADIE") private String noAssurance;
    @SerializedName("COURRIEL") private String courriel;
    @SerializedName("NUM_CIVIQUE") private int numCivique;
    @SerializedName("RUE") private String rue;
    @SerializedName("VILLE") private String ville;
    @SerializedName("CODE_POSTAL") private String codePostal;
    @SerializedName("NUM_TEL") private int noTel;

    // Getters
    public String getPrenom() { return prenom; }
    public String getNom() { return nom; }
    public String getDateNaissance() { return dateNaissance; }
    public String getNoAssurance() { return noAssurance; }
    public String getCourriel() { return courriel; }
    public int getNumCivique() { return numCivique; }
    public String getRue() { return rue; }
    public String getVille() { return ville; }
    public String getCodePostal() { return codePostal; }
    public int getNoTel() { return noTel; }
}
