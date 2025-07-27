package com.example.appmobile;

public class LoginRequest {
    private String COURRIEL;
    private String MOT_DE_PASSE;

    public LoginRequest(String courriel, String motDePasse) {
        this.COURRIEL = courriel;
        this.MOT_DE_PASSE = motDePasse;
    }
}
