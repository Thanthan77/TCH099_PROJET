package com.example.appmobile;

public class RdvInfo {
    private int numRdv;
    private String jourRdv;
    private String heureRdv;
    private int typeRdv;
    private String courriel;
    private String nomService;

    public RdvInfo(int numRdv, String jourRdv, String heureRdv, int typeRdv, String nomService, String medecin) {
        this.numRdv = numRdv;
        this.jourRdv = jourRdv;
        this.heureRdv = heureRdv;
        this.typeRdv = typeRdv;
        this.nomService=nomService ;
    }
    public String getHeureRdv() {
        return heureRdv;
    }
    public String getJourRdv() {
        return jourRdv;
    }
    public String getCourriel() {
        return courriel;
    }
    public int getNumRdv() {return numRdv;}
    public String getNomService() {
        return nomService;
    }
    public void setCourriel(String courriel) {
        this.courriel = courriel;
    }
}
