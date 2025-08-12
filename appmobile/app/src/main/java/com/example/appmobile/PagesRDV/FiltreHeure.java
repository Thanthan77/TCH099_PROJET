package com.example.appmobile.PagesRDV;

import com.google.gson.annotations.SerializedName;

public class FiltreHeure {

    private String heureRdv ;


    private String prenomEmploye ;


    private String nomService ;


    private String jourRdv ;


    private String nomEmploye ;



    public FiltreHeure(String heureRdv, String jourRdv, String prenomEmploye, String nomEmploye, String nomService) {
        this.heureRdv = heureRdv;
        this.jourRdv = jourRdv;
        this.prenomEmploye = prenomEmploye;
        this.nomEmploye = nomEmploye;
        this.nomService = nomService;
    }

    public String getHeureRdv() {
        return heureRdv;
    }

    public String getJourRdv() {
        return jourRdv;
    }

    public String getPrenomEmploye() {
        return prenomEmploye;
    }

    public String getNomEmploye() {
        return nomEmploye;
    }

    public String getNomService() {
        return nomService;
    }


}
