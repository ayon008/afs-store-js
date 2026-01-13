# Configuration AFS_WCML_API_TOKEN

## WordPress (wp-config.php)

Ajoutez la constante suivante dans votre fichier `wp-config.php` :

```php
define( 'AFS_WCML_API_TOKEN', 'votre-token-secret-ici' );
```

**Important** : Remplacez `'votre-token-secret-ici'` par un token sécurisé et unique. Utilisez un générateur de token aléatoire pour générer une chaîne sécurisée.

## Next.js (.env.local)

Ajoutez la variable d'environnement suivante dans votre fichier `.env.local` :

```env
AFS_WCML_API_TOKEN=votre-token-secret-ici
```

**Important** : 
- Le token doit être **identique** à celui défini dans `wp-config.php`
- Ne commitez jamais le fichier `.env.local` dans votre dépôt Git
- Utilisez le même token pour WordPress et Next.js pour que l'authentification fonctionne

## Génération d'un token sécurisé

Vous pouvez générer un token sécurisé en utilisant :

```bash
# Avec OpenSSL
openssl rand -hex 32

# Ou avec Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Vérification

Pour vérifier que la configuration est correcte :

1. Vérifiez que la constante est définie dans WordPress en consultant les logs d'erreur
2. Testez une requête API avec le token Bearer dans l'en-tête Authorization
3. Si vous recevez une erreur 401, vérifiez que les tokens correspondent exactement

