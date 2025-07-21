import android.annotation.SuppressLint;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;

import basesedonnes.DbUtil;
import basesedonnes.clientContact;

public class pageconnection extends AppCompatActivity {

    private TextView messageconnection;
    private EditText emailcoco;
    private EditText motpassecoco;

    private Button blogin;


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        setContentView(R.layout.activity_pageconnection);

        messageconnection = (TextView) findViewById(R.id.textViewconnection);
        emailcoco = (EditText) findViewById(R.id.editTextTextEmailAddressconnection);
        motpassecoco = (EditText) findViewById(R.id.editTextNumberPasswordconnection);
        blogin = (Button) findViewById(R.id.butttonlogin);
        blogin.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                verifierUtilisateur();
            }

            private void verifierUtilisateur() {
                String courriel = emailcoco.getText().toString();
                String motDepasse = motpassecoco.getText().toString();

                DbUtil dbUtil = new DbUtil(pageconnection.this);
                SQLiteDatabase db = dbUtil.getReadableDatabase();


                String[] colonnes = {

                        clientContact.PatientContract.Colonnes.NOM,
                        clientContact.PatientContract.Colonnes.PRENOM

                };

                String selection = clientContact.PatientContract.Colonnes.COURRIEL + "=? AND " +
                        clientContact.PatientContract.Colonnes.MOT_DE_PASSE + "=?";
                String[] selectionArgs = {courriel, motDepasse};

                Cursor curseur = db.query(
                        clientContact.PatientContract.TABLE_NAME,
                        colonnes,
                        selection,
                        selectionArgs,
                        null, null, null
                );

                if (curseur.moveToFirst()) {
                    @SuppressLint("Range") String nom = curseur.getString(curseur.getColumnIndex(clientContact.PatientContract.Colonnes.NOM));
                    @SuppressLint("Range") String prenom = curseur.getString(curseur.getColumnIndex(clientContact.PatientContract.Colonnes.PRENOM));

                    messageconnection.setText("Bienvenue " + prenom + " " + nom);
                } else {
                    messageconnection.setText("Identifiants incorrects");
                }

                curseur.close();
                db.close();


            }
        });


    }
}