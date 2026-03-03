import { fetchLegalText } from "@/lib/erecht24";

export default async function DatenschutzPage() {
  // if API key is configured, attempt to pull the privacy text from eRecht24
  const remoteHtml = await fetchLegalText("privacy");

  return (
    <main className="bg-linear-to-b from-primary-900/50 via-primary-500/25 to-background">
      <section className="bg-background/50 py-48 md:py-24">
        <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 md:flex-row md:items-center">

          {remoteHtml ? (
            <div
              className="flex-1 space-y-6 dark:prose-invert prose max-w-full"
              dangerouslySetInnerHTML={{ __html: remoteHtml }}
            />
          ) : (
            <>
              <div className="flex-1 space-y-6 dark:prose-invert prose max-w-full">
                <header className="space-y-4">
                  <h1 className="text-4xl font-semibold leading-tight text-foreground sm:text-5xl md:text-6xl">
                    Datenschutzerklärung
                  </h1>
                </header>
                <h2 className="text-2xl font-semibold mt-6">1. Datenschutz auf einen Blick</h2>
                <h3 className="text-xl font-medium mt-4">Allgemeine Hinweise</h3>
                <p className="text-base text-foreground/90 leading-relaxed">
                  Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren
                  personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene
                  Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.
                  Ausführliche Informationen zum Thema Datenschutz entnehmen Sie unserer unter diesem
                  Text aufgeführten Datenschutzerklärung.
                </p>

                <h3>Datenerfassung auf dieser Website</h3>
                <h4 className="text-lg font-medium mt-3">
                  Wer ist verantwortlich für die Datenerfassung auf dieser Website?
                </h4>
                <p className="text-base text-foreground/90 leading-relaxed">
                  Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen
                  Kontaktdaten können Sie dem Abschnitt „Hinweis zur Verantwortlichen Stelle“ in dieser
                  Datenschutzerklärung entnehmen.
                </p>

                <h4 className="text-lg font-medium mt-4">Wie erfassen wir Ihre Daten?</h4>
                <p className="text-base text-foreground/90 leading-relaxed">
                  Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen. Hierbei
                  kann es sich z. B. um Daten handeln, die Sie in ein Kontaktformular eingeben.
                </p>
                <p className="text-base text-foreground/90 leading-relaxed">
                  Andere Daten werden automatisch oder nach Ihrer Einwilligung beim Besuch der Website
                  durch unsere IT‑Systeme erfasst. Das sind vor allem technische Daten (z. B.
                  Internetbrowser, Betriebssystem oder Uhrzeit des Seitenaufrufs). Die Erfassung dieser
                  Daten erfolgt automatisch, sobald Sie diese Website betreten.
                </p>

                <h4 className="text-lg font-medium mt-4">Wofür nutzen wir Ihre Daten?</h4>
                <p className="text-base text-foreground/90 leading-relaxed">
                  Ein Teil der Daten wird erhoben, um eine fehlerfreie Bereitstellung der Website zu
                  gewährleisten. Andere Daten können zur Analyse Ihres Nutzerverhaltens verwendet
                  werden. Sofern über die Website Verträge geschlossen oder angebahnt werden können,
                  werden die übermittelten Daten auch für Vertragsangebote, Bestellungen oder sonstige
                  Auftragsanfragen verarbeitet.
                </p>

                <h4 className="text-lg font-medium mt-4">
                  Welche Rechte haben Sie bezüglich Ihrer Daten?
                </h4>
                <p className="text-base text-foreground/90 leading-relaxed">
                  Sie haben jederzeit das Recht, unentgeltlich Auskunft über Herkunft, Empfänger und
                  Zweck Ihrer gespeicherten personenbezogenen Daten zu erhalten. Sie haben außerdem ein
                  Recht, die Berichtigung oder Löschung dieser Daten zu verlangen. Wenn Sie eine
                  Einwilligung zur Datenverarbeitung erteilt haben, können Sie diese Einwilligung
                  jederzeit für die Zukunft widerrufen. Außerdem haben Sie das Recht, unter bestimmten
                  Umständen die Einschränkung der Verarbeitung Ihrer personenbezogenen Daten zu
                  verlangen. Des Weiteren steht Ihnen ein Beschwerderecht bei der zuständigen
                  Aufsichtsbehörde zu.
                </p>
                <p className="text-base text-foreground/90 leading-relaxed">
                  Hierzu sowie zu weiteren Fragen zum Thema Datenschutz können Sie sich jederzeit an uns
                  wenden.
                </p>

                <h2 className="text-2xl font-semibold mt-6">2. Hosting</h2>
                <p className="text-base text-foreground/90 leading-relaxed">
                  Wir hosten die Inhalte unserer Website bei folgendem Anbieter:
                </p>
                <h3 className="text-xl font-medium mt-3">IONOS</h3>
                <p className="text-base text-foreground/90 leading-relaxed">
                  Anbieter ist die IONOS SE, Elgendorfer Str. 57, 56410 Montabaur (nachfolgend IONOS).
                  Wenn Sie unsere Website besuchen, erfasst IONOS verschiedene Logfiles inklusive Ihrer
                  IP‑Adressen. Details entnehmen Sie der Datenschutzerklärung von IONOS:{" "}
                  <a
                    className="text-primary-600 hover:underline"
                    href="https://www.ionos.de/terms-gtc/terms-privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    https://www.ionos.de/terms-gtc/terms-privacy
                  </a>
                  .
                </p>
                <p>
                  Die Verwendung von IONOS erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO. Wir
                  haben ein berechtigtes Interesse an einer möglichst zuverlässigen Darstellung unserer
                  Website. Sofern eine entsprechende Einwilligung abgefragt wurde, erfolgt die
                  Verarbeitung ausschließlich auf Grundlage von Art. 6 Abs. 1 lit. a DSGVO und § 25 Abs.
                  1 TDDDG, soweit die Einwilligung die Speicherung von Cookies oder den Zugriff auf
                  Informationen im Endgerät des Nutzers (z. B. Device‑Fingerprinting) im Sinne des TDDDG
                  umfasst. Die Einwilligung ist jederzeit widerrufbar.
                </p>

                <h4 className="text-lg font-medium mt-4">Auftragsverarbeitung</h4>
                <p className="text-base text-foreground/90 leading-relaxed">
                  Wir haben einen Vertrag über Auftragsverarbeitung (AVV) zur Nutzung des oben genannten
                  Dienstes geschlossen. Hierbei handelt es sich um einen datenschutzrechtlich
                  vorgeschriebenen Vertrag, der gewährleistet, dass dieser die personenbezogenen Daten
                  unserer Websitebesucher nur nach unseren Weisungen und unter Einhaltung der DSGVO
                  verarbeitet.
                </p>

                <h2 className="text-2xl font-semibold mt-6">
                  3. Allgemeine Hinweise und Pflichtinformationen
                </h2>
                <h3 className="text-xl font-medium mt-4">Datenschutz</h3>
                <p className="text-base text-foreground/90 leading-relaxed">
                  Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir
                  behandeln Ihre personenbezogenen Daten vertraulich und entsprechend den gesetzlichen
                  Datenschutzvorschriften sowie dieser Datenschutzerklärung.
                </p>
                <p>
                  Wenn Sie diese Website benutzen, werden verschiedene personenbezogene Daten erhoben.
                  Personenbezogene Daten sind Daten, mit denen Sie persönlich identifiziert werden
                  können. Die vorliegende Datenschutzerklärung erläutert, welche Daten wir erheben und
                  wofür wir sie nutzen. Sie erläutert auch, wie und zu welchem Zweck das geschieht.
                </p>
                <p>
                  Wir weisen darauf hin, dass die Datenübertragung im Internet (z. B. bei der
                  Kommunikation per E‑Mail) Sicherheitslücken aufweisen kann. Ein lückenloser Schutz der
                  Daten vor dem Zugriff durch Dritte ist nicht möglich.
                </p>

                <h3 className="text-xl font-medium mt-4">Hinweis zur verantwortlichen Stelle</h3>
                <p className="text-base text-foreground/90 leading-relaxed">
                  Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:
                </p>
                <address className="not-italic text-base text-foreground/90 mt-2">
                  Frank Spohr
                  <br />
                  Business Solutions
                  <br />
                  Kasseler Straße 76
                  <br />
                  34266 Heiligenrode‑Niestetal
                </address>

                <p className="text-base text-foreground/90 mt-2">
                  Telefon: +4956193719010
                  <br />
                  E‑Mail:{" "}
                  <a
                    className="text-primary-600 hover:underline"
                    href="mailto:f.spohr@busol.info"
                  >
                    f.spohr@busol.info
                  </a>
                </p>

                <p>
                  Verantwortliche Stelle ist die natürliche oder juristische Person, die allein oder
                  gemeinsam mit anderen über die Zwecke und Mittel der Verarbeitung von
                  personenbezogenen Daten (z. B. Namen, E‑Mail‑Adressen o. Ä.) entscheidet.
                </p>

                <h3 className="text-xl font-medium mt-6">Speicherdauer</h3>
                <p className="text-base text-foreground/90 leading-relaxed">
                  Soweit innerhalb dieser Datenschutzerklärung keine speziellere Speicherdauer genannt
                  wurde, verbleiben Ihre personenbezogenen Daten bei uns, bis der Zweck für die
                  Datenverarbeitung entfällt. Wenn Sie ein berechtigtes Löschersuchen geltend machen
                  oder eine Einwilligung zur Datenverarbeitung widerrufen, werden Ihre Daten gelöscht,
                  sofern wir keine anderen rechtlich zulässigen Gründe für die Speicherung Ihrer
                  personenbezogenen Daten haben (z. B. steuer‑ oder handelsrechtliche
                  Aufbewahrungsfristen); im letztgenannten Fall erfolgt die Löschung nach Fortfall
                  dieser Gründe.
                </p>

                <h3>
                  Allgemeine Hinweise zu den Rechtsgrundlagen der Datenverarbeitung auf dieser Website
                </h3>
                <p>
                  Sofern Sie in die Datenverarbeitung eingewilligt haben, verarbeiten wir Ihre
                  personenbezogenen Daten auf Grundlage von Art. 6 Abs. 1 lit. a DSGVO bzw. Art. 9 Abs.
                  2 lit. a DSGVO, sofern besondere Datenkategorien nach Art. 9 Abs. 1 DSGVO verarbeitet
                  werden. Im Falle einer ausdrücklichen Einwilligung in die Übertragung
                  personenbezogener Daten in Drittstaaten erfolgt die Datenverarbeitung außerdem auf
                  Grundlage von Art. 49 Abs. 1 lit. a DSGVO. Sofern Sie in die Speicherung von Cookies
                  oder in den Zugriff auf Informationen in Ihr Endgerät (z. B. via
                  Device‑Fingerprinting) eingewilligt haben, erfolgt die Datenverarbeitung zusätzlich
                  auf Grundlage von § 25 Abs. 1 TDDDG. Die Einwilligung ist jederzeit widerrufbar. Sind
                  Ihre Daten zur Vertragserfüllung oder zur Durchführung vorvertraglicher Maßnahmen
                  erforderlich, verarbeiten wir Ihre Daten auf Grundlage des Art. 6 Abs. 1 lit. b DSGVO.
                  Des Weiteren verarbeiten wir Ihre Daten, sofern diese zur Erfüllung einer rechtlichen
                  Verpflichtung erforderlich sind auf Grundlage von Art. 6 Abs. 1 lit. c DSGVO. Die
                  Datenverarbeitung kann ferner auf Grundlage unseres berechtigten Interesses nach Art.
                  6 Abs. 1 lit. f DSGVO erfolgen. Über die jeweils im Einzelfall einschlägigen
                  Rechtsgrundlagen wird in den folgenden Absätzen dieser Datenschutzerklärung
                  informiert.
                </p>

                <h3 className="text-xl font-medium mt-6">Empfänger von personenbezogenen Daten</h3>
                <p className="text-base text-foreground/90 leading-relaxed">
                  Im Rahmen unserer Geschäftstätigkeit arbeiten wir mit verschiedenen externen Stellen
                  zusammen. Dabei ist teilweise auch eine Übermittlung von personenbezogenen Daten an
                  diese externen Stellen erforderlich. Wir geben personenbezogene Daten nur dann an
                  externe Stellen weiter, wenn dies im Rahmen einer Vertragserfüllung erforderlich ist,
                  wenn wir gesetzlich hierzu verpflichtet sind (z. B. Weitergabe von Daten an
                  Steuerbehörden), wenn wir ein berechtigtes Interesse nach Art. 6 Abs. 1 lit. f DSGVO
                  an der Weitergabe haben oder wenn eine sonstige Rechtsgrundlage die Datenweitergabe
                  erlaubt. Beim Einsatz von Auftragsverarbeitern geben wir personenbezogene Daten
                  unserer Kunden nur auf Grundlage eines gültigen Vertrags über Auftragsverarbeitung
                  weiter. Im Falle einer gemeinsamen Verarbeitung wird ein Vertrag über gemeinsame
                  Verarbeitung geschlossen.
                </p>

                <h3 className="text-xl font-medium mt-6">
                  Widerruf Ihrer Einwilligung zur Datenverarbeitung
                </h3>
                <p className="text-base text-foreground/90 leading-relaxed">
                  Viele Datenverarbeitungsvorgänge sind nur mit Ihrer ausdrücklichen Einwilligung
                  möglich. Sie können eine bereits erteilte Einwilligung jederzeit widerrufen. Die
                  Rechtmäßigkeit der bis zum Widerruf erfolgten Datenverarbeitung bleibt vom Widerruf
                  unberührt.
                </p>

                <h3>
                  Widerspruchsrecht gegen die Datenerhebung in besonderen Fällen sowie gegen
                  Direktwerbung (Art. 21 DSGVO)
                </h3>
                <p>
                  WENN DIE DATENVERARBEITUNG AUF GRUNDLAGE VON ART. 6 ABS. 1 LIT. E ODER F DSGVO
                  ERFOLGT, HABEN SIE JEDERZEIT DAS RECHT, AUS GRÜNDEN, DIE SICH AUS IHRER BESONDEREN
                  SITUATION ERGEBEN, GEGEN DIE VERARBEITUNG IHRER PERSONENBEZOGENEN DATEN WIDERSPRUCH
                  EINZULEGEN; DIES GILT AUCH FÜR EIN AUF DIESE BESTIMMUNGEN GESTÜTZTES PROFILING. DIE
                  JEWEILIGE RECHTSGRUNDLAGE, AUF DENEN EINE VERARBEITUNG BERUHT, ENTNEHMEN SIE DIESER
                  DATENSCHUTZERKLÄRUNG. WENN SIE WIDERSPRUCH EINLEGEN, WERDEN WIR IHRE BETROFFENEN
                  PERSONENBEZOGENEN DATEN NICHT MEHR VERARBEITET, ES SEI DENN, WIR KÖNNEN ZWINGENDE
                  SCHUTZWÜRDIGE GRÜNDE FÜR DIE VERARBEITUNG NACHWEISEN, DIE IHRE INTERESSEN, RECHTE UND
                  FREIHEITEN ÜBERWIEGEN ODER DIE VERARBEITUNG DIENT DER GELTENDMACHUNG, AUSÜBUNG ODER
                  VERTEIDIGUNG VON RECHTSANSPRÜCHEN (WIDERSPRUCH NACH ART. 21 ABS. 1 DSGVO).
                </p>

                <h3>Beschwerderecht bei der zuständigen Aufsichtsbehörde</h3>
                <p>
                  Im Falle von Verstößen gegen die DSGVO steht den Betroffenen ein Beschwerderecht bei
                  einer Aufsichtsbehörde, insbesondere in dem Mitgliedstaat ihres gewöhnlichen
                  Aufenthalts, ihres Arbeitsplatzes oder des Orts des mutmaßlichen Verstoßes zu. Das
                  Beschwerderecht besteht unbeschadet anderweitiger verwaltungsrechtlicher oder
                  gerichtlicher Rechtsbehelfe.
                </p>

                <h3>Recht auf Datenübertragbarkeit</h3>
                <p>
                  Sie haben das Recht, Daten, die wir auf Grundlage Ihrer Einwilligung oder in Erfüllung
                  eines Vertrags automatisiert verarbeiten, an sich oder an einen Dritten in einem
                  gängigen, maschinenlesbaren Format aushändigen zu lassen. Sofern Sie die direkte
                  Übertragung der Daten an einen anderen Verantwortlichen verlangen, erfolgt dies nur,
                  soweit es technisch machbar ist.
                </p>

                <h3>Auskunft, Berichtigung und Löschung</h3>
                <p>
                  Sie haben im Rahmen der geltenden gesetzlichen Bestimmungen jederzeit das Recht auf
                  unentgeltliche Auskunft über Ihre gespeicherten personenbezogenen Daten, deren
                  Herkunft und Empfänger und den Zweck der Datenverarbeitung und ggf. ein Recht auf
                  Berichtigung oder Löschung dieser Daten. Hierzu sowie zu weiteren Fragen zum Thema
                  personenbezogene Daten können Sie sich jederzeit an uns wenden.
                </p>

                <h3>Recht auf Einschränkung der Verarbeitung</h3>
                <p>
                  Sie haben das Recht, die Einschränkung der Verarbeitung Ihrer personenbezogenen Daten
                  zu verlangen. Hierzu können Sie sich jederzeit an uns wenden. Das Recht auf
                  Einschränkung der Verarbeitung besteht in folgenden Fällen:
                </p>
                <ul>
                  <li>
                    Wenn Sie die Richtigkeit Ihrer bei uns gespeicherten personenbezogenen Daten
                    bestreiten, benötigen wir in der Regel Zeit, um dies zu überprüfen. F&uuml;r die
                    Dauer der Prüfung haben Sie das Recht, die Einschränkung der Verarbeitung Ihrer
                    personenbezogenen Daten zu verlangen.
                  </li>
                  <li>
                    Wenn die Verarbeitung Ihrer personenbezogenen Daten unrechtmäßig geschah/geschieht,
                    können Sie statt der Löschung die Einschränkung der Datenverarbeitung verlangen.
                  </li>
                  <li>
                    Wenn wir Ihre personenbezogenen Daten nicht mehr benötigen, Sie sie jedoch zur
                    Ausübung, Verteidigung oder Geltendmachung von Rechtsansprüchen benötigen, haben Sie
                    das Recht, statt der Löschung die Einschränkung der Verarbeitung Ihrer
                    personenbezogenen Daten zu verlangen.
                  </li>
                  <li>
                    Wenn Sie einen Widerspruch nach Art. 21 Abs. 1 DSGVO eingelegt haben, muss eine
                    Abwägung zwischen Ihren und unseren Interessen vorgenommen werden. Solange noch
                    nicht feststeht, wessen Interessen überwiegen, haben Sie das Recht, die
                    Einschränkung der Verarbeitung Ihrer personenbezogenen Daten zu verlangen.
                  </li>
                </ul>
                <p>
                  Wenn Sie die Verarbeitung Ihrer personenbezogenen Daten eingeschränkt haben, dürfen
                  diese Daten – von ihrer Speicherung abgesehen – nur mit Ihrer Einwilligung oder zur
                  Geltendmachung, Ausübung oder Verteidigung von Rechtsansprüchen oder zum Schutz der
                  Rechte einer anderen natürlichen oder juristischen Person oder aus Gründen eines
                  wichtigen öffentlichen Interesses der Europäischen Union oder eines Mitgliedstaats
                  verarbeitet werden.
                </p>

                <h3>SSL- bzw. TLS-Verschlüsselung</h3>
                <p>
                  Diese Seite nutzt aus Sicherheitsgründen und zum Schutz der Übertragung vertraulicher
                  Inhalte, wie zum Beispiel Bestellungen oder Anfragen, die Sie an uns als
                  Seitenbetreiber senden, eine SSL‑ bzw. TLS‑Verschlüsselung. Eine verschlüsselte
                  Verbindung erkennen Sie daran, dass die Adresszeile des Browsers von „http://“ auf
                  „https://“ wechselt und an dem Schloss‑Symbol in Ihrer Browserzeile.
                </p>
                <p>
                  Wenn die SSL‑ bzw. TLS‑Verschlüsselung aktiviert ist, können die Daten, die Sie an uns
                  übermitteln, nicht von Dritten mitgelesen werden.
                </p>

                <h2>4. Datenerfassung auf dieser Website</h2>
                <h3>Server‑Log‑Dateien</h3>
                <p>
                  Der Provider der Seiten erhebt und speichert automatisch Informationen in so genannten
                  Server‑Log‑Dateien, die Ihr Browser automatisch an uns übermittelt. Dies sind:
                </p>
                <ul>
                  <li>Browsertyp und Browserversion</li>
                  <li>verwendetes Betriebssystem</li>
                  <li>Referrer URL</li>
                  <li>Hostname des zugreifenden Rechners</li>
                  <li>Uhrzeit der Serveranfrage</li>
                  <li>IP‑Adresse</li>
                </ul>
                <p>
                  Eine Zusammenführung dieser Daten mit anderen Datenquellen wird nicht vorgenommen.
                </p>
                <p>
                  Die Erfassung dieser Daten erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO. Der
                  Websitebetreiber hat ein berechtigtes Interesse an der technisch fehlerfreien
                  Darstellung und der Optimierung seiner Website – hierzu müssen die Server‑Log‑Files
                  erfasst werden.
                </p>

                <h3>Anfrage per E‑Mail, Telefon oder Telefax</h3>
                <p>
                  Wenn Sie uns per E‑Mail, Telefon oder Telefax kontaktieren, wird Ihre Anfrage
                  inklusive aller daraus hervorgehenden personenbezogenen Daten (Name, Anfrage) zum
                  Zwecke der Bearbeitung Ihres Anliegens bei uns gespeichert und verarbeitet. Diese
                  Daten geben wir nicht ohne Ihre Einwilligung weiter.
                </p>
                <p>
                  Die Verarbeitung dieser Daten erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO,
                  sofern Ihre Anfrage mit der Erfüllung eines Vertrags zusammenhängt oder zur
                  Durchf&uuml;hrung vorvertraglicher Maßnahmen erforderlich ist. In allen übrigen Fällen
                  beruht die Verarbeitung auf unserem berechtigten Interesse an der effektiven
                  Bearbeitung der an uns gerichteten Anfragen (Art. 6 Abs. 1 lit. f DSGVO) oder auf
                  Ihrer Einwilligung (Art. 6 Abs. 1 lit. a DSGVO) sofern diese abgefragt wurde; die
                  Einwilligung ist jederzeit widerrufbar.
                </p>

                <h2>5. Plugins und Tools</h2>
                <h3>Google Fonts</h3>
                <p>
                  Diese Seite nutzt zur einheitlichen Darstellung von Schriftarten so genannte Google
                  Fonts, die von Google bereitgestellt werden. Beim Aufruf einer Seite lädt Ihr Browser
                  die benötigten Fonts in ihren Browsercache, um Texte und Schriftarten korrekt
                  anzuzeigen.
                </p>
                <p>
                  Zu diesem Zweck muss der von Ihnen verwendete Browser Verbindung zu den Servern von
                  Google aufnehmen. Hierdurch erlangt Google Kenntnis darüber, dass über Ihre IP‑Adresse
                  diese Website aufgerufen wurde. Die Nutzung von Google Fonts erfolgt auf Grundlage von
                  Art. 6 Abs. 1 lit. f DSGVO. Der Websitebetreiber hat ein berechtigtes Interesse an der
                  einheitlichen Darstellung des Schriftbildes auf seiner Website. Sofern eine
                  entsprechende Einwilligung abgefragt wurde, erfolgt die Verarbeitung ausschließlich
                  auf Grundlage von Art. 6 Abs. 1 lit. a DSGVO und § 25 Abs. 1 TDDDG, soweit die
                  Einwilligung die Speicherung von Cookies oder den Zugriff auf Informationen im
                  Endgerät des Nutzers (z. B. Device‑Fingerprinting) im Sinne des TDDDG umfasst. Die
                  Einwilligung ist jederzeit widerrufbar.
                </p>
                <p>
                  Wenn Ihr Browser Google Fonts nicht unterstützt, wird eine Standardschrift von Ihrem
                  Computer genutzt.
                </p>
                <p>
                  Das Unternehmen verfügt über eine Zertifizierung nach dem „EU‑US Data Privacy
                  Framework“ (DPF). Der DPF ist ein Übereinkommen zwischen der Europäischen Union und
                  den USA, der die Einhaltung europäischer Datenschutzstandards bei Datenverarbeitungen
                  in den USA gewährleisten soll. Jedes nach dem DPF zertifizierte Unternehmen
                  verpflichtet sich, diese Datenschutzstandards einzuhalten. Weitere Informationen
                  hierzu erhalten Sie vom Anbieter unter folgendem Link:{" "}
                  <a
                    href="https://www.dataprivacyframework.gov/participant/5780"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    https://www.dataprivacyframework.gov/participant/5780
                  </a>
                  .
                </p>

                <h2>6. eCommerce und Zahlungsanbieter</h2>
                <h3>
                  Datenübermittlung bei Vertragsschluss für Online‑Shops, Händler und Warenversand
                </h3>
                <p>
                  Wenn Sie Waren bei uns bestellen, geben wir Ihre personenbezogenen Daten an das zur
                  Lieferung betraute Transportunternehmen sowie an den mit der Zahlungsabwicklung
                  beauftragten Zahlungsdienstleister weiter. Es werden nur solche Daten herausgegeben,
                  die der jeweilige Dienstleister zur Erfüllung seiner Aufgabe benötigt. Rechtsgrundlage
                  hierfür ist Art. 6 Abs. 1 lit. b DSGVO, der die Verarbeitung von Daten zur Erfüllung
                  eines Vertrags oder vorvertraglicher Maßnahmen gestattet. Sofern Sie eine
                  entsprechende Einwilligung nach Art. 6 Abs. 1 lit. a DSGVO erteilt haben, werden wir
                  Ihre E‑Mail‑Adresse an das mit der Lieferung betraute Transportunternehmen übergeben,
                  damit dieses Sie per E‑Mail über den Versandstatus Ihrer Bestellung informieren kann;
                  Sie können die Einwilligung jederzeit widerrufen.
                </p>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
