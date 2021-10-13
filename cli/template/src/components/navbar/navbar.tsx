import styles from '@app/components/navbar/navbar.module.css'
import Link from 'next/link'

export const C = () => {
  return (
    <div className={styles.container}>
      <Link href="/">
        <h1 className={styles.brand}>Terraform Visual</h1>
      </Link>

    </div>
  )
}
