package com.example.appmobile;

public class RdvInfo {
    private int numRdv;
    private String jourRdv;
    private String heureRdv;
    private int typeRdv;
    private String courriel;
    private String nomService;
    private String medecin;

    public RdvInfo(int numRdv, String jourRdv, String heureRdv, int typeRdv, String nomService, String medecin) {
        this.numRdv = numRdv;
        this.jourRdv = jourRdv;
        this.heureRdv = heureRdv;
        this.typeRdv = typeRdv;
        this.nomService = nomService;
        this.medecin = medecin;
    }

    public int getNumRdv() {
        return numRdv;
    }

    public String getJourRdv() {
        return jourRdv;
    }

    public String getHeureRdv() {
        return heureRdv;
    }

    public int getTypeRdv() {
        return typeRdv;
    }

    public String getCourriel() {
        return courriel;
    }

    public void setCourriel(String courriel) {
        this.courriel = courriel;
    }

    public String getNomService() {
        return nomService;
    }

    public String getMedecin() {
        return medecin;
    }
}
