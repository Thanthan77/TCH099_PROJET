package com.example.appmobile;

import com.google.gson.annotations.SerializedName;

public class RdvCreationRequest {

    @SerializedName("NOM_EMPLOYE")
    private String nomEmploye;

    @SerializedName("NOM_SERVICE")
    private String nomService;

    @SerializedName("COURRIEL")
    private String courriel;

    @SerializedName("JOUR")
    private String jour;

    @SerializedName("HEURE")
    private String heure;

    public RdvCreationRequest(String nomEmploye, String nomService, String courriel, String jour, String heure) {
        this.nomEmploye = nomEmploye;
        this.nomService = nomService;
        this.courriel = courriel;
        this.jour = jour;
        this.heure = heure;
    }

    public String getCourriel() {
        return courriel;
    }

    public String getNomEmploye() {
        return nomEmploye;
    }

    public String getNomService() {
        return nomService;
    }

    public String getHeure() {
        return heure;
    }

    public String getJour() {
        return jour;
    }
}
