package com.example.appmobile.PagesRDV;

public class HoraireRdv {
    private String nomService;
    private String jourRdv;
    private String heureRdv;

    public HoraireRdv(String nomService, String jourRdv, String heureRdv) {
        this.nomService = nomService;
        this.jourRdv = jourRdv;
        this.heureRdv = heureRdv;
    }

    public String getNomService() {
        return nomService;
    }

    public String getJourRdv() {
        return jourRdv;
    }

    public String getHeureRdv() {
        return heureRdv;
    }
}
