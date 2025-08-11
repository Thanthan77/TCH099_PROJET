package com.example.appmobile.PagesRDV;

public class HoraireRdv {
    private String nomService;
    private String jourRdv;
    private String heureRdv;
    private String nomEmploye;

    public HoraireRdv(String nomService, String jourRdv, String heureRdv, String nomEmploye) {
        this.nomService = nomService;
        this.jourRdv = jourRdv;
        this.heureRdv = heureRdv;
        this.nomEmploye = nomEmploye ;
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
    public String getNomEmploye() { return nomEmploye ;
    }
}
