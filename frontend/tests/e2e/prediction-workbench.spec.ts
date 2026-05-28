import { expect, test } from '@playwright/test'

test.describe('Match prediction workbench', () => {
  test('edits multiple predictions from the agenda and saves them in one action', async ({ page }) => {
    const uniqueSuffix = Date.now()
    const email = `workbench-${uniqueSuffix}@example.com`
    const password = 'DuroGolpe1!'

    await page.goto('/register')
    await page.getByLabel(/nome/i).fill('Workbench Tester')
    await page.getByLabel(/e-mail/i).fill(email)
    await page.locator('#password').fill(password)
    await page.locator('#confirmPassword').fill(password)
    await page.getByRole('button', { name: /criar conta/i }).click()

    await expect(page).toHaveURL(/\/matches$/)

    const homeInput = page.getByRole('spinbutton', { name: /palpite/i }).first()
    const awayInput = page.getByRole('spinbutton', { name: /palpite/i }).nth(1)

    await homeInput.fill('2')
    await awayInput.fill('1')

    await expect(page.getByRole('button', { name: /salvar 1 palpites/i })).toBeVisible()
    await page.getByRole('button', { name: /salvar 1 palpites/i }).click()

    await expect(page.getByText(/1 palpites salvos com sucesso|1 palpites salvos/i)).toBeVisible()
    await page.reload()
    await expect(page.getByText(/Atual:\s*2 - 1/i)).toBeVisible()
  })
})
