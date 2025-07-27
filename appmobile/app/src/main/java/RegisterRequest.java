public class RegisterRequest {
    private String COURRIEL;
    private String MOT_DE_PASSE;
    private String PRENOM_PATIENT;
    private String NOM_PATIENT;
    private String NUM_TEL;
    private String NUM_CIVIQUE;
    private String RUE;
    private String VILLE;
    private String CODE_POSTAL;
    private String NO_ASSURANCE_MALADIE;
    private String DATE_NAISSANCE;

    public RegisterRequest(String courriel, String motDePasse, String prenom, String nom,
                           String tel, String civique, String rue, String ville,
                           String codePostal, String assurance, String naissance) {
        this.COURRIEL = courriel;
        this.MOT_DE_PASSE = motDePasse;
        this.PRENOM_PATIENT = prenom;
        this.NOM_PATIENT = nom;
        this.NUM_TEL = tel;
        this.NUM_CIVIQUE = civique;
        this.RUE = rue;
        this.VILLE = ville;
        this.CODE_POSTAL = codePostal;
        this.NO_ASSURANCE_MALADIE = assurance;
        this.DATE_NAISSANCE = naissance;
    }
}
