export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 px-6 py-20">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">プライバシーポリシー</h1>
        
        <div className="prose prose-gray max-w-none">
          <p className="text-gray-600 mb-6">
            最終更新日: 2024年1月1日
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. 収集する情報</h2>
            <p className="text-gray-600">
              当サービスでは、以下の情報を収集します：
            </p>
            <ul className="list-disc pl-6 text-gray-600 mt-2">
              <li>メールアドレス</li>
              <li>氏名（任意）</li>
              <li>Twitterアカウント情報（連携時）</li>
              <li>作成したコンテンツとその分析データ</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. 情報の利用目的</h2>
            <p className="text-gray-600">
              収集した情報は以下の目的で利用します：
            </p>
            <ul className="list-disc pl-6 text-gray-600 mt-2">
              <li>サービスの提供と改善</li>
              <li>ユーザーサポートの提供</li>
              <li>サービスに関する重要なお知らせの送信</li>
              <li>利用状況の分析と機能改善</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. 情報の共有</h2>
            <p className="text-gray-600">
              お客様の個人情報は、以下の場合を除き、第三者に共有されません：
            </p>
            <ul className="list-disc pl-6 text-gray-600 mt-2">
              <li>お客様の同意がある場合</li>
              <li>法的要求に応じる場合</li>
              <li>サービス提供に必要な場合（Twitter API等）</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. データの保護</h2>
            <p className="text-gray-600">
              当社は、お客様の個人情報を保護するため、適切なセキュリティ対策を実施しています。
              ただし、インターネット上の通信は100％安全ではないことをご理解ください。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. お問い合わせ</h2>
            <p className="text-gray-600">
              プライバシーポリシーに関するご質問は、以下までお問い合わせください：
            </p>
            <p className="text-gray-600 mt-2">
              メール: support@example.com
            </p>
          </section>
        </div>

        <div className="mt-12">
          <a href="/" className="text-blue-600 hover:text-blue-500">
            ← ホームに戻る
          </a>
        </div>
      </div>
    </div>
  )
}