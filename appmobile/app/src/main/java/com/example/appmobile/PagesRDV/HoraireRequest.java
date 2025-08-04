package com.example.appmobile.PagesRDV;

import com.google.gson.annotations.SerializedName;

public class HoraireRequest {
    @SerializedName("JOUR")
    private String jourRdv;

    @SerializedName("HEURE")
    private String heureRdv;

    @SerializedName("NOM_EMPLOYE")
    private String nomEmploye;

    @SerializedName("PRENOM_EMPLOYE")
    private String prenomEmploye;

    @SerializedName("NOM_SERVICE")
    private String nomService;

    public String getJourRdv() {
        return jourRdv;
    }

    public String getHeureRdv() {
        return heureRdv;
    }

    public String getNomEmploye() {
        return nomEmploye;
    }

    public String getPrenomEmploye() {
        return prenomEmploye;
    }

    public String getNomService() {
        return nomService;
    }
}






