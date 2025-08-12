package com.example.appmobile.PagesRDV;

public class FiltrePersonnel {


    private int codeEmploye ;

    private String nomEmploye ;


    public FiltrePersonnel( int codeEmploye, String nomEmploye) {
        this.codeEmploye = codeEmploye ;
        this.nomEmploye = nomEmploye ;


    }



    public int getCodeEmploye() {
        return codeEmploye;
    }

    public String getNomEmploye() {
        return nomEmploye;
    }
}
