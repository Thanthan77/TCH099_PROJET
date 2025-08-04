package com.example.appmobile;

public class RdvInfo {

    private int idRdv;
    private String jourRdv;
    private String heureRdv;

    private int typeRdv;

    private String courriel;




    public RdvInfo(int idRdv,String jourRdv, String heureRdv, int typeRdv, int numRdv) {

        this.idRdv = idRdv;
        this.jourRdv = jourRdv;
        this.heureRdv = heureRdv;
        this.typeRdv = typeRdv;


    }
    public String getHeureRdv() {
        return heureRdv;
    }

    public String getJourRdv() {
        return jourRdv;
    }

    public int getTypeRdv() {
        return typeRdv;
    }

    public String getCourriel() {
        return courriel;
    }
    public int getIdRdv() {return idRdv;}




    public void setCourriel(String courriel) {
        this.courriel = courriel;
    }

}
